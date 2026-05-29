import { describe, expect, it } from "vitest";

import type { RankingState } from "./types";
import { shouldHydrateExternalState } from "./hydration";

const rankingState = (updatedAt: number): RankingState => ({
	event: {
		id: "event-1",
		title: "Event",
		createdAt: 1,
	},
	players: [],
	lastAction: null,
	updatedAt,
});

describe("shouldHydrateExternalState", () => {
	it("accepts only newer external state", () => {
		const current = rankingState(100);

		expect(shouldHydrateExternalState(current, rankingState(101))).toBe(true);
		expect(shouldHydrateExternalState(current, rankingState(100))).toBe(false);
		expect(shouldHydrateExternalState(current, rankingState(99))).toBe(false);
	});
});
