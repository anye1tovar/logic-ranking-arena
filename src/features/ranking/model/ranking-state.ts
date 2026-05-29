import type { RankingState } from "./types";

export type RankingOperationContext = {
	now: () => number;
	createId: () => string;
};

export const toRankingState = (state: RankingState): RankingState => ({
	event: state.event,
	players: state.players,
	lastAction: state.lastAction,
	updatedAt: state.updatedAt,
});

export const createRankingSnapshot = (
	state: RankingState,
	patch: Partial<RankingState>,
): RankingState =>
	toRankingState({
		event: patch.event ?? state.event,
		players: patch.players ?? state.players,
		lastAction: patch.lastAction ?? state.lastAction,
		updatedAt: patch.updatedAt ?? state.updatedAt,
	});

export const createDefaultRankingState = (
	ctx: RankingOperationContext,
): RankingState => {
	const now = ctx.now();

	return {
		event: {
			id: ctx.createId(),
			title: "Logic Ranking Arena",
			subtitle: "Configura tu torneo desde /admin",
			createdAt: now,
		},
		players: [],
		lastAction: null,
		updatedAt: now,
	};
};
