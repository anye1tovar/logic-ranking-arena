import DeleteRounded from "@mui/icons-material/DeleteRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import LooksOneRounded from "@mui/icons-material/LooksOneRounded";
import PlusOneRounded from "@mui/icons-material/PlusOneRounded";
import RemoveRounded from "@mui/icons-material/RemoveRounded";
import SportsScoreRounded from "@mui/icons-material/SportsScoreRounded";
import WorkspacePremiumRounded from "@mui/icons-material/WorkspacePremiumRounded";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Button, Chip, Stack, Typography } from "@mui/material";

import type { Player } from "../../types/ranking";
import { formatDelta, medalForRank, statusLabel, statusTone } from "../../utils/ranking";
import styles from "./player-card.module.scss";

type Props = {
  player: Player;
  rank: number;
  admin?: boolean;
  onAddPoint?: (id: string, delta: number) => void;
  onAddWin?: (id: string) => void;
  onSetStatus?: (id: string, status: Player["status"]) => void;
  onRemove?: (id: string) => void;
};

export const PlayerCard = ({
  player,
  rank,
  admin = false,
  onAddPoint,
  onAddWin,
  onSetStatus,
  onRemove
}: Props) => {
  const topCard = rank < 3;

  return (
    <motion.article
      layout
      transition={{
        layout: {
          duration: 0.4,
          ease: "easeInOut"
        }
      }}
      className={clsx(styles.card, styles[`status${capitalize(player.status)}`], {
        [styles.topCard]: topCard
      })}
    >
      <div className={styles.rank}>{medalForRank(rank)}</div>
      <div className={styles.body}>
        <div className={styles.name}>
          <Typography className={styles.playerName}>{player.name}</Typography>
          <Chip
            label={statusLabel[player.status]}
            color={statusTone[player.status]}
            variant={player.status === "active" ? "outlined" : "filled"}
            size="small"
          />
          {player.streak > 1 ? <Chip label={`Racha x${player.streak}`} color="secondary" size="small" /> : null}
        </div>
        <Typography className={styles.subline}>
          {player.wins} victorias • actualizado {new Date(player.updatedAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
        </Typography>
        {admin ? (
          <div className={styles.controls}>
            <Button size="small" variant="contained" startIcon={<PlusOneRounded />} onClick={() => onAddPoint?.(player.id, 1)}>
              +1
            </Button>
            <Button size="small" variant="contained" color="warning" startIcon={<LooksOneRounded />} onClick={() => onAddPoint?.(player.id, 3)}>
              +3
            </Button>
            <Button size="small" variant="outlined" color="inherit" startIcon={<RemoveRounded />} onClick={() => onAddPoint?.(player.id, -1)}>
              -1
            </Button>
            <Button size="small" variant="outlined" color="secondary" startIcon={<SportsScoreRounded />} onClick={() => onAddWin?.(player.id)}>
              Win
            </Button>
            <Button size="small" variant="outlined" color="secondary" onClick={() => onSetStatus?.(player.id, "classified")}>
              Classify
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={() => onSetStatus?.(player.id, "eliminated")}>
              Eliminate
            </Button>
            <Button size="small" variant="contained" color="warning" startIcon={<EmojiEventsRounded />} onClick={() => onSetStatus?.(player.id, "champion")}>
              Champion
            </Button>
            <Button size="small" variant="text" color="inherit" startIcon={<DeleteRounded />} onClick={() => onRemove?.(player.id)}>
              Quitar
            </Button>
          </div>
        ) : null}
      </div>
      <div className={styles.scoreboard}>
        <Typography className={styles.points}>{player.points}</Typography>
        <Typography className={styles.pointsLabel}>Points</Typography>
      </div>
      <div className={styles.flashes}>
        <AnimatePresence>
          {player.scoreFlashes.map((flash, index) => (
            <motion.div
              key={flash.id}
              className={styles.floating}
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: 1, y: -26 - index * 14, scale: 1 }}
              exit={{ opacity: 0, y: -42 - index * 14, scale: 0.82 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {formatDelta(flash.value)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
