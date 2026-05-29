import type { RankingState } from "../model/types";

export const STORAGE_KEY = "logic-ranking-state";

export const loadState = (): RankingState | null => {
	if (typeof window === "undefined") return null;

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<RankingState>;
		if (!parsed.event || !parsed.players || typeof parsed.updatedAt !== "number") {
			return null;
		}

		return {
			event: parsed.event,
			players: parsed.players,
			lastAction: parsed.lastAction ?? null,
			updatedAt: parsed.updatedAt,
		};
	} catch {
		return null;
	}
};

export const saveState = (state: RankingState) => {
	if (typeof window === "undefined") return;

	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
