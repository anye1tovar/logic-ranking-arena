import { create } from "zustand";

import { shouldHydrateExternalState } from "../model/hydration";
import {
	applyAddPlayer,
	applyEventUpdate,
	applyPointChange,
	applyRemovePlayer,
	applyResetEvent,
	applyResetScores,
	applyStatusChange,
	applyUpdatePlayer,
	applyWin,
} from "../model/ranking-operations";
import {
	createDefaultRankingState,
	toRankingState,
	type RankingOperationContext,
} from "../model/ranking-state";
import type {
	EventInput,
	PlayerInput,
	PlayerStatus,
	RankingState,
} from "../model/types";
import { createId } from "../../../utils/id";
import { loadState, saveState } from "../infrastructure/persistence";
import { broadcastState } from "../infrastructure/sync-engine";

export type RankingStore = RankingState & {
	updateEvent: (event: EventInput) => void;
	resetEvent: () => void;
	addPlayer: (input: PlayerInput) => void;
	updatePlayer: (id: string, input: PlayerInput) => void;
	removePlayer: (id: string) => void;
	resetScores: () => void;
	changePoints: (id: string, delta: number) => void;
	addWin: (id: string) => void;
	setStatus: (id: string, status: PlayerStatus) => void;
	clearFlashes: (id: string) => void;
	hydrateExternalState: (state: RankingState) => void;
};

const operationContext: RankingOperationContext = {
	now: () => Date.now(),
	createId,
};

const baseState = loadState() ?? createDefaultRankingState(operationContext);

const syncState = (state: RankingState) => {
	const serializableState = toRankingState(state);
	saveState(serializableState);
	broadcastState(serializableState);
};

const persistNextState = (nextState: RankingState) => {
	syncState(nextState);
	return nextState;
};

export const useRankingStore = create<RankingStore>((set) => ({
	...baseState,
	updateEvent: (event) =>
		set((state) =>
			persistNextState(applyEventUpdate(state, event, operationContext)),
		),
	resetEvent: () =>
		set((state) =>
			persistNextState(applyResetEvent(state, operationContext)),
		),
	addPlayer: (input) =>
		set((state) =>
			persistNextState(applyAddPlayer(state, input, operationContext)),
		),
	updatePlayer: (id, input) =>
		set((state) =>
			persistNextState(applyUpdatePlayer(state, id, input, operationContext)),
		),
	removePlayer: (id) =>
		set((state) =>
			persistNextState(applyRemovePlayer(state, id, operationContext)),
		),
	resetScores: () =>
		set((state) => persistNextState(applyResetScores(state, operationContext))),
	changePoints: (id, delta) =>
		set((state) =>
			persistNextState(applyPointChange(state, id, delta, operationContext)),
		),
	addWin: (id) =>
		set((state) => persistNextState(applyWin(state, id, operationContext))),
	setStatus: (id, status) =>
		set((state) =>
			persistNextState(applyStatusChange(state, id, status, operationContext)),
		),
	clearFlashes: (id) =>
		set((state) => ({
			players: state.players.map((player) =>
				player.id === id ? { ...player, scoreFlashes: [] } : player,
			),
		})),
	hydrateExternalState: (externalState) =>
		set((state) => {
			if (!shouldHydrateExternalState(state, externalState)) {
				return state;
			}

			saveState(externalState);
			return externalState;
		}),
}));
