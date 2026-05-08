import type { RankingState } from "../types/ranking";

export const STORAGE_KEY = "logic-ranking-state";

export const loadState = (): RankingState | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RankingState;
  } catch {
    return null;
  }
};

export const saveState = (state: RankingState) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
