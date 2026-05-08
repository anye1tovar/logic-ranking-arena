import { useEffect } from "react";

import { useRankingStore } from "../store/ranking-store";
import { subscribeToStateSync } from "../store/sync-engine";

export const useRankingSync = () => {
  const hydrateExternalState = useRankingStore((state) => state.hydrateExternalState);

  useEffect(() => subscribeToStateSync(hydrateExternalState), [hydrateExternalState]);
};
