import { Typography } from "@mui/material";

import type { Player } from "../../types/ranking";
import type { PlayerEffectState } from "../../types/viewer-effects";
import { PlayerCard } from "../player-card/player-card";
import styles from "./leaderboard.module.scss";

type Props = {
  players: Player[];
  admin?: boolean;
  viewerMode?: boolean;
  playerEffects?: Record<string, PlayerEffectState>;
  rankOffset?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onAddPoint?: (id: string, delta: number) => void;
  onAddWin?: (id: string) => void;
  onSetStatus?: (id: string, status: Player["status"]) => void;
  onRemove?: (id: string) => void;
};

export const Leaderboard = (props: Props) => {
  if (props.players.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Typography variant="h6">
          {props.emptyTitle ?? "Todavía no hay jugadores en la arena"}
        </Typography>
        <Typography>
          {props.emptyDescription ?? "Agrega participantes desde el panel admin para empezar el ranking."}
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.leaderboard}>
      {props.players.map((player, index) => (
        <PlayerCard
          key={player.id}
          player={player}
          rank={(props.rankOffset ?? 0) + index}
          admin={props.admin}
          viewerMode={props.viewerMode}
          effectState={props.playerEffects?.[player.id]}
          onAddPoint={props.onAddPoint}
          onAddWin={props.onAddWin}
          onSetStatus={props.onSetStatus}
          onRemove={props.onRemove}
        />
      ))}
    </div>
  );
};
