import { describe, expect, it } from "vitest";

import type { Player } from "../model/types";
import { detectViewerEffects } from "./detect-viewer-effects";

const player = (overrides: Partial<Player> & Pick<Player, "id">): Player => ({
	id: overrides.id,
	name: overrides.name ?? `Player ${overrides.id}`,
	points: overrides.points ?? 0,
	wins: overrides.wins ?? 0,
	status: overrides.status ?? "active",
	streak: overrides.streak ?? 0,
	updatedAt: overrides.updatedAt ?? 1,
	scoreFlashes: overrides.scoreFlashes ?? [],
});

const detect = (previousPlayers: Player[], players: Player[]) => {
	let trigger = 100;
	return detectViewerEffects(previousPlayers, players, {
		createTriggerBase: (_player, index) => trigger++ + index,
		createResetId: () => "reset-fixed",
	});
};

describe("detectViewerEffects", () => {
	it("returns a new player trigger and sound for players that were not present before", () => {
		const result = detect([], [player({ id: "a" })]);

		expect(result.playerEffects.a).toEqual({ newPlayerTrigger: 100 });
		expect(result.soundEvents).toEqual([
			{ id: "a-newPlayer-100", type: "newPlayer", playerId: "a" },
		]);
		expect(result.championEffect).toBeNull();
		expect(result.classifiedEffect).toBeNull();
		expect(result.victoryEffect).toBeNull();
		expect(result.eliminatedEffect).toBeNull();
		expect(result.resetEffect).toBeNull();
	});

	it("detects rank movement and preserves moveDelta semantics", () => {
		const previous = [player({ id: "a" }), player({ id: "b" })];
		const current = [player({ id: "b" }), player({ id: "a" })];

		const result = detect(previous, current);

		expect(result.playerEffects.b).toMatchObject({
			moveTrigger: 100.1,
			moveDelta: -1,
		});
		expect(result.playerEffects.a).toMatchObject({
			moveTrigger: 102.1,
			moveDelta: 1,
		});
		expect(result.soundEvents).toEqual([
			{ id: "b-moveUp-100", type: "moveUp", playerId: "b" },
			{ id: "a-moveDown-102", type: "moveDown", playerId: "a" },
		]);
	});

	it("detects point gain and loss sounds without card triggers", () => {
		const previous = [
			player({ id: "a", points: 1 }),
			player({ id: "b", points: 4 }),
		];
		const current = [
			player({ id: "a", points: 3 }),
			player({ id: "b", points: 2 }),
		];

		const result = detect(previous, current);

		expect(result.playerEffects).toEqual({});
		expect(result.soundEvents).toEqual([
			{ id: "a-pointGain-100", type: "pointGain", playerId: "a" },
			{ id: "b-pointLoss-102", type: "pointLoss", playerId: "b" },
		]);
	});

	it("detects wins and emits card, sound, and victory overlay effects", () => {
		const previous = [player({ id: "a", wins: 1 })];
		const current = [player({ id: "a", wins: 2, name: "Ada" })];

		const result = detect(previous, current);

		expect(result.playerEffects.a).toEqual({ winTrigger: 100.2 });
		expect(result.soundEvents).toEqual([
			{ id: "a-win-100", type: "win", playerId: "a" },
		]);
		expect(result.victoryEffect).toEqual({
			id: "a-victory-100",
			playerName: "Ada",
		});
	});

	it("detects classified status and emits card, sound, and classified overlay effects", () => {
		const previous = [player({ id: "a", status: "active" })];
		const current = [player({ id: "a", status: "classified", name: "Grace" })];

		const result = detect(previous, current);

		expect(result.playerEffects.a).toEqual({ classifiedTrigger: 100.3 });
		expect(result.soundEvents).toEqual([
			{ id: "a-classified-100", type: "classified", playerId: "a" },
		]);
		expect(result.classifiedEffect).toEqual({
			id: "a-classified-100",
			playerName: "Grace",
		});
	});

	it("detects eliminated status as card and overlay visual effects with sound", () => {
		const previous = [player({ id: "a", status: "active" })];
		const current = [player({ id: "a", status: "eliminated", name: "Nox" })];

		const result = detect(previous, current);

		expect(result.playerEffects.a).toEqual({ eliminatedTrigger: 100.4 });
		expect(result.soundEvents).toEqual([
			{ id: "a-eliminated-100", type: "eliminated", playerId: "a" },
		]);
		expect(result.championEffect).toBeNull();
		expect(result.classifiedEffect).toBeNull();
		expect(result.victoryEffect).toBeNull();
		expect(result.eliminatedEffect).toEqual({
			id: "a-eliminated-100",
			playerName: "Nox",
		});
	});

	it("detects removed players as eliminated overlay effects with sound", () => {
		const previous = [player({ id: "a", name: "Removed Nox" })];
		const current: Player[] = [];

		const result = detect(previous, current);

		expect(result.playerEffects).toEqual({});
		expect(result.soundEvents).toEqual([
			{ id: "a-eliminated-100", type: "eliminated", playerId: "a" },
		]);
		expect(result.eliminatedEffect).toEqual({
			id: "a-removed-100",
			playerName: "Removed Nox",
		});
	});

	it("detects champion status and returns champion overlay for viewer priority handling", () => {
		const previous = [player({ id: "a", status: "active", wins: 1 })];
		const current = [
			player({ id: "a", status: "champion", wins: 2, name: "Lin" }),
		];

		const result = detect(previous, current);

		expect(result.playerEffects.a).toEqual({
			winTrigger: 100.2,
			championTrigger: 100.5,
		});
		expect(result.soundEvents).toEqual([
			{ id: "a-win-100", type: "win", playerId: "a" },
			{ id: "a-champion-100", type: "champion", playerId: "a" },
		]);
		expect(result.championEffect).toEqual({ id: "a-100", playerName: "Lin" });
		expect(result.victoryEffect).toEqual({
			id: "a-victory-100",
			playerName: "Lin",
		});
	});

	it("detects reset when previous total points were positive and current players are all zero", () => {
		const previous = [
			player({ id: "a", points: 3 }),
			player({ id: "b", points: 2 }),
		];
		const current = [
			player({ id: "a", points: 0 }),
			player({ id: "b", points: 0 }),
		];

		const result = detect(previous, current);

		expect(result.resetEffect).toEqual({ id: "reset-fixed" });
		expect(result.soundEvents).toEqual([
			{ id: "a-pointLoss-100", type: "pointLoss", playerId: "a" },
			{ id: "b-pointLoss-102", type: "pointLoss", playerId: "b" },
			{ id: "reset-reset-fixed", type: "reset" },
		]);
	});

	it("returns no effects for unchanged state", () => {
		const previous = [
			player({ id: "a", points: 1, wins: 1, status: "active" }),
		];
		const current = [player({ id: "a", points: 1, wins: 1, status: "active" })];

		expect(detect(previous, current)).toEqual({
			playerEffects: {},
			championEffect: null,
			classifiedEffect: null,
			victoryEffect: null,
			eliminatedEffect: null,
			resetEffect: null,
			soundEvents: [],
		});
	});
});
