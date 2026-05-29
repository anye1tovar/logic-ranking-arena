import type { RankingState } from "./types";

export const shouldHydrateExternalState = (
  current: RankingState,
  external: RankingState
) => external.updatedAt > current.updatedAt;
