import type { RankingState } from "../types/ranking";

export const SYNC_CHANNEL_NAME = "logic-ranking";

type SyncMessage = {
  type: "state-sync";
  payload: RankingState;
};

let channel: BroadcastChannel | null = null;

const getChannel = () => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  if (!channel) {
    channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }

  return channel;
};

export const broadcastState = (state: RankingState) => {
  getChannel()?.postMessage({
    type: "state-sync",
    payload: state
  } satisfies SyncMessage);
};

export const subscribeToStateSync = (onState: (state: RankingState) => void) => {
  const activeChannel = getChannel();
  const channelHandler = (event: MessageEvent<SyncMessage>) => {
    if (event.data?.type === "state-sync") {
      onState(event.data.payload);
    }
  };

  activeChannel?.addEventListener("message", channelHandler);

  const storageHandler = (event: StorageEvent) => {
    if (event.key !== "logic-ranking-state" || !event.newValue) return;
    try {
      onState(JSON.parse(event.newValue) as RankingState);
    } catch {
      return;
    }
  };

  window.addEventListener("storage", storageHandler);

  return () => {
    activeChannel?.removeEventListener("message", channelHandler);
    window.removeEventListener("storage", storageHandler);
  };
};
