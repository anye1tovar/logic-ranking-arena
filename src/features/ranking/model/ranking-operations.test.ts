import { describe, expect, it } from "vitest";

import type { Player, RankingState } from "./types";
import {
	applyAddPlayer,
	applyPointChange,
	applyResetEvent,
	applyResetScores,
	applyStatusChange,
	applyWin,
} from "./ranking-operations";

const state = (players: Player[] = [], updatedAt = 100): RankingState => ({
	event: {
		id: "event-1",
		title: "Event",
		subtitle: "Sub",
		createdAt: 1,
	},
	players,
	lastAction: null,
	updatedAt,
});

const player = (overrides: Partial<Player> & Pick<Player, "id">): Player => ({
	id: overrides.id,
	name: overrides.name ?? overrides.id,
	points: overrides.points ?? 0,
	wins: overrides.wins ?? 0,
	status: overrides.status ?? "active",
	streak: overrides.streak ?? 0,
	updatedAt: overrides.updatedAt ?? 10,
	scoreFlashes: overrides.scoreFlashes ?? [],
});

const ctx = (now = 200) => {
	let id = 0;
	return {
		now: () => now,
		createId: () => `generated-${++id}`,
	};
};

describe("ranking operations", () => {
	it("adds a trimmed active player with initial score fields", () => {
		const next = applyAddPlayer(state(), { name: "  Ada  " }, ctx(250));

		expect(next.updatedAt).toBe(250);
		expect(next.players).toEqual([
			{
				id: "generated-1",
				name: "Ada",
				points: 0,
				wins: 0,
				status: "active",
				streak: 0,
				updatedAt: 250,
				scoreFlashes: [],
			},
		]);
	});

	it("changes points with a zero floor, streak rules, and capped score flashes", () => {
		const base = state([
			player({
				id: "ada",
				points: 2,
				streak: 2,
				scoreFlashes: [
					{ id: "flash-1", value: 1, createdAt: 1 },
					{ id: "flash-2", value: 1, createdAt: 2 },
				],
			}),
		]);

		const afterPositive = applyPointChange(base, "ada", 3, ctx(300));
		expect(afterPositive.players[0]).toMatchObject({ points: 5, streak: 3, updatedAt: 300 });
		expect(afterPositive.players[0].scoreFlashes).toEqual([
			{ id: "flash-1", value: 1, createdAt: 1 },
			{ id: "flash-2", value: 1, createdAt: 2 },
			{ id: "generated-1", value: 3, createdAt: 300 },
		]);

		const afterNegative = applyPointChange(afterPositive, "ada", -99, ctx(400));
		expect(afterNegative.players[0]).toMatchObject({ points: 0, streak: 0, updatedAt: 400 });
		expect(afterNegative.players[0].scoreFlashes).toEqual([
			{ id: "flash-2", value: 1, createdAt: 2 },
			{ id: "generated-1", value: 3, createdAt: 300 },
			{ id: "generated-1", value: -99, createdAt: 400 },
		]);
		expect(afterNegative.lastAction).toBeNull();
	});

	it("increments wins and streak", () => {
		const next = applyWin(state([player({ id: "ada", wins: 2, streak: 4 })]), "ada", ctx(500));

		expect(next.players[0]).toMatchObject({ wins: 3, streak: 5, updatedAt: 500 });
		expect(next.updatedAt).toBe(500);
	});

	it("resets scores, statuses, streaks, and score flashes", () => {
		const next = applyResetScores(
			state([
				player({ id: "ada", points: 12, wins: 2, streak: 4, status: "champion", scoreFlashes: [{ id: "f", value: 1, createdAt: 1 }] }),
				player({ id: "grace", points: 8, wins: 1, streak: 3, status: "eliminated" }),
			]),
			ctx(600),
		);

		expect(next.players).toEqual([
			expect.objectContaining({ id: "ada", points: 0, wins: 0, streak: 0, status: "active", updatedAt: 600, scoreFlashes: [] }),
			expect.objectContaining({ id: "grace", points: 0, wins: 0, streak: 0, status: "active", updatedAt: 600, scoreFlashes: [] }),
		]);
		expect(next.lastAction).toBeNull();
	});

	it("resets the full event and records an explicit reset action", () => {
		const next = applyResetEvent(
			state([player({ id: "ada", points: 12, status: "champion" })], 150),
			ctx(650),
		);

		expect(next.event).toEqual({
			id: "generated-1",
			title: "Logic Ranking Arena",
			subtitle: "Configura tu torneo desde /admin",
			createdAt: 650,
		});
		expect(next.players).toEqual([]);
		expect(next.lastAction).toEqual({
			id: "generated-2",
			type: "resetEvent",
			createdAt: 650,
		});
		expect(next.updatedAt).toBe(650);
	});

	it("keeps champion status unique", () => {
		const next = applyStatusChange(
			state([
				player({ id: "ada", status: "champion" }),
				player({ id: "grace", status: "classified" }),
			]),
			"grace",
			"champion",
			ctx(700),
		);

		expect(next.players.find(({ id }) => id === "grace")?.status).toBe("champion");
		expect(next.players.filter(({ status }) => status === "champion")).toHaveLength(1);
		expect(next.lastAction).toEqual({
			id: "generated-1",
			type: "champion",
			createdAt: 700,
			playerId: "grace",
		});
	});

	it("records classify actions even when the player was already classified", () => {
		const next = applyStatusChange(
			state([player({ id: "ada", status: "classified" })]),
			"ada",
			"classified",
			ctx(710),
		);

		expect(next.players[0]).toMatchObject({
			id: "ada",
			status: "classified",
			updatedAt: 710,
		});
		expect(next.lastAction).toEqual({
			id: "generated-1",
			type: "classified",
			createdAt: 710,
			playerId: "ada",
		});
	});
});
