import { create } from "zustand";

import { createId } from "../utils/id";
import { sortPlayers } from "../utils/ranking";
import type { EventInput, Player, PlayerInput, PlayerStatus, RankingState, ScoreFlash } from "../types/ranking";
import { loadState, saveState } from "./persistence";
import { broadcastState } from "./sync-engine";

type RankingStore = RankingState & {
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

const toRankingState = (state: RankingState): RankingState => ({
  event: state.event,
  players: state.players,
  updatedAt: state.updatedAt
});

const createSnapshot = (
  state: RankingState,
  patch: Partial<RankingState>
): RankingState =>
  toRankingState({
    event: patch.event ?? state.event,
    players: patch.players ?? state.players,
    updatedAt: patch.updatedAt ?? state.updatedAt
  });

const createDefaultState = (): RankingState => ({
  event: {
    id: createId(),
    title: "Logic Ranking Arena",
    subtitle: "Configura tu torneo desde /admin",
    createdAt: Date.now()
  },
  players: [],
  updatedAt: Date.now()
});

const baseState = loadState() ?? createDefaultState();

const syncState = (state: RankingState) => {
  const serializableState = toRankingState(state);
  saveState(serializableState);
  broadcastState(serializableState);
};

const updatePlayerCollection = (
  players: Player[],
  updater: (player: Player) => Player
) => {
  const nextPlayers = sortPlayers(players.map((player) => updater(player)));
  return nextPlayers;
};

const createFlash = (value: number): ScoreFlash => ({
  id: createId(),
  value,
  createdAt: Date.now()
});

export const useRankingStore = create<RankingStore>((set) => ({
  ...baseState,
  updateEvent: (event) =>
    set((state) => {
      const nextState = createSnapshot(state, {
        event: {
          ...state.event,
          title: event.title.trim() || "Logic Ranking Arena",
          subtitle: event.subtitle?.trim() || ""
        },
        updatedAt: Date.now()
      });
      syncState(nextState);
      return nextState;
    }),
  resetEvent: () =>
    set(() => {
      const nextState = createDefaultState();
      syncState(nextState);
      return nextState;
    }),
  addPlayer: (input) =>
    set((state) => {
      const now = Date.now();
      const nextState = createSnapshot(state, {
        players: sortPlayers([
          ...state.players,
          {
            id: createId(),
            name: input.name.trim(),
            points: 0,
            wins: 0,
            status: "active",
            streak: 0,
            updatedAt: now,
            scoreFlashes: []
          }
        ]),
        updatedAt: now
      });
      syncState(nextState);
      return nextState;
    }),
  updatePlayer: (id, input) =>
    set((state) => {
      const nextPlayers = updatePlayerCollection(state.players, (player) =>
        player.id === id ? { ...player, name: input.name.trim(), updatedAt: Date.now() } : player
      );
      const nextState = createSnapshot(state, {
        players: nextPlayers,
        updatedAt: Date.now()
      });
      syncState(nextState);
      return nextState;
    }),
  removePlayer: (id) =>
    set((state) => {
      const nextState = createSnapshot(state, {
        players: state.players.filter((player) => player.id !== id),
        updatedAt: Date.now()
      });
      syncState(nextState);
      return nextState;
    }),
  resetScores: () =>
    set((state) => {
      const now = Date.now();
      const nextState = createSnapshot(state, {
        players: sortPlayers(
          state.players.map((player) => ({
            ...player,
            points: 0,
            wins: 0,
            streak: 0,
            status: "active",
            updatedAt: now,
            scoreFlashes: []
          }))
        ),
        updatedAt: now
      });
      syncState(nextState);
      return nextState;
    }),
  changePoints: (id, delta) =>
    set((state) => {
      const now = Date.now();
      const nextPlayers = updatePlayerCollection(state.players, (player) => {
        if (player.id !== id) return player;

        return {
          ...player,
          points: Math.max(0, player.points + delta),
          streak: delta > 0 ? player.streak + 1 : 0,
          updatedAt: now,
          scoreFlashes: [...player.scoreFlashes, createFlash(delta)].slice(-3)
        };
      });
      const nextState = createSnapshot(state, {
        players: nextPlayers,
        updatedAt: now
      });
      syncState(nextState);
      return nextState;
    }),
  addWin: (id) =>
    set((state) => {
      const now = Date.now();
      const nextPlayers = updatePlayerCollection(state.players, (player) =>
        player.id === id
          ? {
              ...player,
              wins: player.wins + 1,
              streak: player.streak + 1,
              updatedAt: now
            }
          : player
      );
      const nextState = createSnapshot(state, {
        players: nextPlayers,
        updatedAt: now
      });
      syncState(nextState);
      return nextState;
    }),
  setStatus: (id, status) =>
    set((state) => {
      const now = Date.now();
      const nextPlayers: Player[] = updatePlayerCollection(state.players, (player) => {
        if (player.id !== id) return status === "champion" && player.status === "champion"
          ? { ...player, status: "active", updatedAt: now }
          : player;

        return {
          ...player,
          status,
          updatedAt: now
        };
      }).map((player): Player => {
        if (status !== "champion") return player;
        if (player.id === id) return player;
        return player.status === "champion" ? { ...player, status: "classified" } : player;
      });
      const nextState = createSnapshot(state, {
        players: sortPlayers(nextPlayers),
        updatedAt: now
      });
      syncState(nextState);
      return nextState;
    }),
  clearFlashes: (id) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id ? { ...player, scoreFlashes: [] } : player
      )
    })),
  hydrateExternalState: (externalState) =>
    set((state) => {
      if (externalState.updatedAt <= state.updatedAt) {
        return state;
      }

      saveState(externalState);
      return externalState;
    })
}));
