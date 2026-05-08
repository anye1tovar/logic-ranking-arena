import DeleteRounded from "@mui/icons-material/DeleteRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import LooksOneRounded from "@mui/icons-material/LooksOneRounded";
import PlusOneRounded from "@mui/icons-material/PlusOneRounded";
import RemoveRounded from "@mui/icons-material/RemoveRounded";
import SportsScoreRounded from "@mui/icons-material/SportsScoreRounded";
import NorthRounded from "@mui/icons-material/NorthRounded";
import WhatshotRounded from "@mui/icons-material/WhatshotRounded";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Button, Chip, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import type { Player } from "../../types/ranking";
import type { PlayerEffectState } from "../../types/viewer-effects";
import { formatDelta, medalForRank, statusLabel, statusTone } from "../../utils/ranking";
import styles from "./player-card.module.scss";

type Props = {
  player: Player;
  rank: number;
  admin?: boolean;
  viewerMode?: boolean;
  effectState?: PlayerEffectState;
  onAddPoint?: (id: string, delta: number) => void;
  onAddWin?: (id: string) => void;
  onSetStatus?: (id: string, status: Player["status"]) => void;
  onRemove?: (id: string) => void;
};

type ActiveFlags = {
  newPlayer: boolean;
  win: boolean;
  classified: boolean;
  eliminated: boolean;
  champion: boolean;
  move: boolean;
};

const defaultFlags: ActiveFlags = {
  newPlayer: false,
  win: false,
  classified: false,
  eliminated: false,
  champion: false,
  move: false
};

export const PlayerCard = ({
  player,
  rank,
  admin = false,
  viewerMode = false,
  effectState,
  onAddPoint,
  onAddWin,
  onSetStatus,
  onRemove
}: Props) => {
  const topCard = rank < 3;
  const [activeFlags, setActiveFlags] = useState<ActiveFlags>(defaultFlags);
  const [moveDelta, setMoveDelta] = useState(0);

  useTransientFlag(effectState?.newPlayerTrigger, "newPlayer", setActiveFlags, 1200);
  useTransientFlag(effectState?.winTrigger, "win", setActiveFlags, 1100);
  useTransientFlag(effectState?.classifiedTrigger, "classified", setActiveFlags, 1400);
  useTransientFlag(effectState?.eliminatedTrigger, "eliminated", setActiveFlags, 1400);
  useTransientFlag(effectState?.championTrigger, "champion", setActiveFlags, 1700);
  useTransientFlag(effectState?.moveTrigger, "move", setActiveFlags, 900, () => {
    setMoveDelta(effectState?.moveDelta ?? 0);
  });

  const showScoreImpact = viewerMode && player.scoreFlashes.length > 0;
  const latestFlash = player.scoreFlashes[player.scoreFlashes.length - 1];
  const moveLabel = useMemo(() => {
    if (moveDelta < 0) return `Sube ${Math.abs(moveDelta)}`;
    if (moveDelta > 0) return `Baja ${moveDelta}`;
    return "";
  }, [moveDelta]);

  return (
    <motion.article
      layout
      initial={viewerMode ? { opacity: 0, y: 26, scale: 0.96 } : false}
      animate={
        viewerMode
          ? {
              opacity: player.status === "eliminated" ? 0.56 : 1,
              y: activeFlags.eliminated ? 10 : 0,
              scale: activeFlags.champion ? 1.04 : activeFlags.newPlayer ? 1.02 : 1
            }
          : undefined
      }
      whileHover={viewerMode ? { scale: 1.01 } : undefined}
      transition={{
        layout: {
          duration: 0.48,
          ease: "easeInOut"
        },
        opacity: { duration: 0.28 },
        y: { duration: 0.34 },
        scale: { duration: 0.34 }
      }}
      className={clsx(styles.card, styles[`status${capitalize(player.status)}`], {
        [styles.topCard]: topCard,
        [styles.viewerCard]: viewerMode,
        [styles.pointsBurst]: showScoreImpact,
        [styles.effectNewPlayer]: activeFlags.newPlayer,
        [styles.effectWin]: activeFlags.win,
        [styles.effectClassified]: activeFlags.classified,
        [styles.effectEliminated]: activeFlags.eliminated,
        [styles.effectChampion]: activeFlags.champion,
        [styles.effectMoveUp]: activeFlags.move && moveDelta < 0,
        [styles.effectMoveDown]: activeFlags.move && moveDelta > 0
      })}
    >
      <div className={styles.overlayEffects}>
        {showScoreImpact && latestFlash ? (
          <motion.div
            key={latestFlash.id}
            className={clsx(styles.scoreRipple, {
              [styles.scoreRippleNegative]: latestFlash.value < 0,
              [styles.scoreRippleStrong]: latestFlash.value >= 3
            })}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.95, 0], scale: [0.6, latestFlash.value >= 3 ? 1.28 : 1.18, 1.58] }}
            transition={{ duration: latestFlash.value >= 3 ? 0.9 : 0.72, ease: "easeOut" }}
          />
        ) : null}
        <AnimatePresence>
          {activeFlags.classified ? (
            <motion.div
              key={`classified-${effectState?.classifiedTrigger}`}
              className={styles.classifiedSweep}
              initial={{ x: "-120%", opacity: 0 }}
              animate={{ x: "120%", opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {activeFlags.eliminated ? (
            <motion.div
              key={`eliminated-${effectState?.eliminatedTrigger}`}
              className={styles.eliminationMark}
              initial={{ opacity: 0, scale: 0.86, rotate: -10 }}
              animate={{ opacity: [0, 1, 0.22], scale: [0.86, 1.02, 1], rotate: [-10, 0, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            >
              ELIMINATED
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {activeFlags.newPlayer ? (
            <motion.div
              key={`new-${effectState?.newPlayerTrigger}`}
              className={styles.newPlayerBanner}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: [0, 1, 0], y: [18, 0, -8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            >
              NEW ENTRY
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {activeFlags.win ? (
            <motion.div
              key={`win-${effectState?.winTrigger}`}
              className={styles.winBurst}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 1, 0], scale: [0.7, 1.14, 1.28] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <WhatshotRounded fontSize="small" />
              Win
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {activeFlags.move && moveLabel ? (
            <motion.div
              key={`move-${effectState?.moveTrigger}`}
              className={clsx(styles.moveBadge, {
                [styles.moveBadgeDown]: moveDelta > 0
              })}
              initial={{ opacity: 0, x: moveDelta < 0 ? -20 : 20, scale: 0.86 }}
              animate={{ opacity: [0, 1, 0], x: [moveDelta < 0 ? -20 : 20, 0, 0], scale: [0.86, 1, 0.96] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.95, ease: "easeOut" }}
            >
              <NorthRounded fontSize="small" />
              {moveLabel}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
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
              className={clsx(styles.floating, {
                [styles.floatingStrong]: flash.value >= 3,
                [styles.floatingNegative]: flash.value < 0
              })}
              initial={{ opacity: 0, y: 18, scale: 0.68 }}
              animate={{
                opacity: 1,
                y: -(viewerMode ? 44 : 26) - index * 16,
                scale: viewerMode ? [0.75, flash.value >= 3 ? 1.34 : 1.22, 1] : 1
              }}
              exit={{ opacity: 0, y: -(viewerMode ? 72 : 42) - index * 14, scale: 0.82 }}
              transition={{ duration: viewerMode ? 1 : 0.8, ease: "easeOut" }}
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

const useTransientFlag = (
  trigger: number | undefined,
  key: keyof ActiveFlags,
  setFlags: React.Dispatch<React.SetStateAction<ActiveFlags>>,
  duration: number,
  onStart?: () => void
) => {
  useEffect(() => {
    if (!trigger) return;

    onStart?.();
    setFlags((current) => ({ ...current, [key]: true }));
    const timeout = window.setTimeout(() => {
      setFlags((current) => ({ ...current, [key]: false }));
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [duration, key, onStart, setFlags, trigger]);
};
