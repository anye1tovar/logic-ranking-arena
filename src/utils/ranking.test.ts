import { describe, expect, it } from "vitest";

import type { Player, PlayerStatus } from "../types/ranking";
import { sortPlayers } from "./ranking";

const player = (overrides: Partial<Player> & Pick<Player, "id">): Player => ({
	id: overrides.id,
	name: overrides.name ?? overrides.id,
	points: overrides.points ?? 0,
	wins: overrides.wins ?? 0,
	status: overrides.status ?? "active",
	streak: overrides.streak ?? 0,
	updatedAt: overrides.updatedAt ?? 0,
	scoreFlashes: overrides.scoreFlashes ?? [],
});

const ids = (players: Player[]) => players.map(({ id }) => id);

describe("sortPlayers", () => {
	it("sorts by points descending first", () => {
		const players = [
			player({
				id: "low",
				points: 4,
				wins: 9,
				status: "champion",
				updatedAt: 30,
			}),
			player({
				id: "high",
				points: 12,
				wins: 0,
				status: "eliminated",
				updatedAt: 10,
			}),
			player({
				id: "middle",
				points: 8,
				wins: 3,
				status: "active",
				updatedAt: 20,
			}),
		];

		expect(ids(sortPlayers(players))).toEqual(["high", "middle", "low"]);
	});

	it("uses wins descending when points are tied", () => {
		const players = [
			player({
				id: "one-win",
				points: 10,
				wins: 1,
				status: "champion",
				updatedAt: 30,
			}),
			player({
				id: "three-wins",
				points: 10,
				wins: 3,
				status: "eliminated",
				updatedAt: 10,
			}),
			player({
				id: "two-wins",
				points: 10,
				wins: 2,
				status: "active",
				updatedAt: 20,
			}),
		];

		expect(ids(sortPlayers(players))).toEqual([
			"three-wins",
			"two-wins",
			"one-win",
		]);
	});

	it("uses status precedence when points and wins are tied", () => {
		const statuses: PlayerStatus[] = [
			"eliminated",
			"active",
			"classified",
			"champion",
		];
		const players = statuses.map((status, index) =>
			player({ id: status, points: 10, wins: 2, status, updatedAt: index }),
		);

		expect(ids(sortPlayers(players))).toEqual([
			"champion",
			"classified",
			"active",
			"eliminated",
		]);
	});

	it("uses latest updatedAt when points, wins, and status are tied", () => {
		const players = [
			player({
				id: "oldest",
				points: 10,
				wins: 2,
				status: "active",
				updatedAt: 100,
			}),
			player({
				id: "newest",
				points: 10,
				wins: 2,
				status: "active",
				updatedAt: 300,
			}),
			player({
				id: "middle",
				points: 10,
				wins: 2,
				status: "active",
				updatedAt: 200,
			}),
		];

		expect(ids(sortPlayers(players))).toEqual(["newest", "middle", "oldest"]);
	});

	it("returns a sorted copy without mutating the original player array", () => {
		const players = [
			player({ id: "original-first", points: 1 }),
			player({ id: "original-second", points: 5 }),
		];

		const sorted = sortPlayers(players);

		expect(ids(sorted)).toEqual(["original-second", "original-first"]);
		expect(ids(players)).toEqual(["original-first", "original-second"]);
		expect(sorted).not.toBe(players);
	});
});
