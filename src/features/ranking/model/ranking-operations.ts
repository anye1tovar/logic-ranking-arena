import type { EventInput, Player, PlayerInput, PlayerStatus, RankingState, ScoreFlash } from "./types";
import { sortPlayers } from "./ranking-sort";
import {
  createDefaultRankingState,
  createRankingSnapshot,
  type RankingOperationContext
} from "./ranking-state";

const updatePlayerCollection = (
  players: Player[],
  updater: (player: Player) => Player
) => sortPlayers(players.map((player) => updater(player)));

const createFlash = (value: number, ctx: RankingOperationContext): ScoreFlash => ({
  id: ctx.createId(),
  value,
  createdAt: ctx.now()
});

export const applyEventUpdate = (
  state: RankingState,
  event: EventInput,
  ctx: RankingOperationContext
): RankingState =>
  createRankingSnapshot(state, {
    event: {
      ...state.event,
      title: event.title.trim() || "Logic Ranking Arena",
      subtitle: event.subtitle?.trim() || ""
    },
    lastAction: null,
    updatedAt: ctx.now()
  });

export const applyResetEvent = (
  state: RankingState,
  ctx: RankingOperationContext
): RankingState => {
  const nextState = createDefaultRankingState(ctx);
  const now = ctx.now();

  return createRankingSnapshot(nextState, {
    lastAction: {
      id: ctx.createId(),
      type: "resetEvent",
      createdAt: now,
    },
    updatedAt: now,
  });
};

export const applyAddPlayer = (
  state: RankingState,
  input: PlayerInput,
  ctx: RankingOperationContext
): RankingState => {
  const now = ctx.now();

  return createRankingSnapshot(state, {
    players: sortPlayers([
      ...state.players,
      {
        id: ctx.createId(),
        name: input.name.trim(),
        points: 0,
        wins: 0,
        status: "active",
        streak: 0,
        updatedAt: now,
        scoreFlashes: []
      }
    ]),
    lastAction: null,
    updatedAt: now
  });
};

export const applyUpdatePlayer = (
  state: RankingState,
  id: string,
  input: PlayerInput,
  ctx: RankingOperationContext
): RankingState => {
  const now = ctx.now();
  const nextPlayers = updatePlayerCollection(state.players, (player) =>
    player.id === id ? { ...player, name: input.name.trim(), updatedAt: now } : player
  );

  return createRankingSnapshot(state, {
    players: nextPlayers,
    lastAction: null,
    updatedAt: now
  });
};

export const applyRemovePlayer = (
  state: RankingState,
  id: string,
  ctx: RankingOperationContext
): RankingState =>
  createRankingSnapshot(state, {
    players: state.players.filter((player) => player.id !== id),
    lastAction: null,
    updatedAt: ctx.now()
  });

export const applyResetScores = (
  state: RankingState,
  ctx: RankingOperationContext
): RankingState => {
  const now = ctx.now();

  return createRankingSnapshot(state, {
    players: sortPlayers(
      state.players.map((player) => ({
        ...player,
        points: 0,
        wins: 0,
        streak: 0,
        status: "active" as const,
        updatedAt: now,
        scoreFlashes: []
      }))
    ),
    lastAction: null,
    updatedAt: now
  });
};

export const applyPointChange = (
  state: RankingState,
  id: string,
  delta: number,
  ctx: RankingOperationContext
): RankingState => {
  const now = ctx.now();
  const flashCtx: RankingOperationContext = { ...ctx, now: () => now };
  const nextPlayers = updatePlayerCollection(state.players, (player) => {
    if (player.id !== id) return player;

    return {
      ...player,
      points: Math.max(0, player.points + delta),
      streak: delta > 0 ? player.streak + 1 : 0,
      updatedAt: now,
      scoreFlashes: [...player.scoreFlashes, createFlash(delta, flashCtx)].slice(-3)
    };
  });

  return createRankingSnapshot(state, {
    players: nextPlayers,
    lastAction: null,
    updatedAt: now
  });
};

export const applyWin = (
  state: RankingState,
  id: string,
  ctx: RankingOperationContext
): RankingState => {
  const now = ctx.now();
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

  return createRankingSnapshot(state, {
    players: nextPlayers,
    lastAction: null,
    updatedAt: now
  });
};

export const applyStatusChange = (
  state: RankingState,
  id: string,
  status: PlayerStatus,
  ctx: RankingOperationContext
): RankingState => {
  const now = ctx.now();
  const nextPlayers: Player[] = updatePlayerCollection(state.players, (player) => {
    if (player.id !== id) {
      return status === "champion" && player.status === "champion"
        ? { ...player, status: "active", updatedAt: now }
        : player;
    }

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

  return createRankingSnapshot(state, {
    players: sortPlayers(nextPlayers),
    lastAction:
      status === "classified" || status === "eliminated" || status === "champion"
        ? {
            id: ctx.createId(),
            type: status,
            createdAt: now,
            playerId: id,
          }
        : null,
    updatedAt: now
  });
};
