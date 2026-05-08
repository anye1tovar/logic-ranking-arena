import { Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

import styles from "./viewer-effects-layer.module.scss";

type NamedEffect = {
  id: string;
  playerName: string;
};

type ResetEffect = {
  id: string;
};

type Props = {
  championEffect: NamedEffect | null;
  classifiedEffect: NamedEffect | null;
  victoryEffect: NamedEffect | null;
  resetEffect: ResetEffect | null;
};

const fireworks = [
  { left: "12%", top: "18%" },
  { left: "24%", top: "44%" },
  { left: "82%", top: "22%" },
  { left: "74%", top: "56%" },
  { left: "48%", top: "16%" },
  { left: "58%", top: "72%" }
];

const confetti = Array.from({ length: 24 }, (_, index) => ({
  left: `${(index % 8) * 12 + 6}%`,
  delay: (index % 6) * 0.08,
  color: ["#f4c542", "#b7ff00", "#ffffff", "#ffd36e"][index % 4]
}));

const centerShards = Array.from({ length: 12 }, (_, index) => ({
  angle: index * 30,
  color: ["#f4c542", "#b7ff00", "#ffffff"][index % 3]
}));

export const ViewerEffectsLayer = ({
  championEffect,
  classifiedEffect,
  victoryEffect,
  resetEffect
}: Props) => (
  <>
    <AnimatePresence>
      {championEffect ? (
        <motion.div
          key={championEffect.id}
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className={styles.championBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {fireworks.map((firework, index) => (
            <motion.span
              key={`${championEffect.id}-firework-${index}`}
              className={styles.firework}
              style={firework}
              initial={{ opacity: 0, scale: 0.15 }}
              animate={{ opacity: [0, 1, 0.5, 0], scale: [0.15, 1.8, 2.8, 0.8] }}
              transition={{ duration: 1.6, delay: index * 0.12, ease: "easeOut" }}
            />
          ))}
          {confetti.map((piece, index) => (
            <motion.span
              key={`${championEffect.id}-confetti-${index}`}
              className={styles.confetti}
              style={{ left: piece.left, background: piece.color, top: "-5%" }}
              initial={{ opacity: 0, y: -40, rotate: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: ["0vh", "32vh", "78vh"], rotate: [0, 120, 260] }}
              transition={{ duration: 2, delay: piece.delay, ease: "easeOut" }}
            />
          ))}
          <div className={styles.championCenter}>
            <motion.div
              className={styles.championBadge}
              initial={{ opacity: 0, scale: 0.72, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -18 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <motion.div
                className={styles.trophy}
                animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 1.2, repeat: 1, ease: "easeInOut" }}
              >
                🏆
              </motion.div>
              <Typography className={styles.eyebrow}>Champion Unlocked</Typography>
              <Typography className={styles.championName}>{championEffect.playerName}</Typography>
              <Typography className={styles.subline}>La arena tiene nuevo campeón</Typography>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>

    <AnimatePresence>
      {classifiedEffect ? (
        <motion.div
          key={classifiedEffect.id}
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className={styles.classifiedBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.65, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
          />
          {centerShards.map((shard, index) => (
            <motion.span
              key={`${classifiedEffect.id}-classified-${index}`}
              className={styles.centerShard}
              style={{ background: shard.color, rotate: `${shard.angle}deg` }}
              initial={{ opacity: 0, scaleY: 0.2 }}
              animate={{ opacity: [0, 1, 0], scaleY: [0.2, 1.25, 0.4], x: [0, Math.cos((shard.angle * Math.PI) / 180) * 120], y: [0, Math.sin((shard.angle * Math.PI) / 180) * 120] }}
              transition={{ duration: 1.05, delay: index * 0.02, ease: "easeOut" }}
            />
          ))}
          <div className={styles.midCenter}>
            <motion.div
              className={styles.classifiedBadge}
              initial={{ opacity: 0, scale: 0.78, y: 18 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.78, 1, 1.04, 0.96], y: [18, 0, 0, -12] }}
              transition={{ duration: 1.25, ease: "easeOut" }}
            >
              <Typography className={styles.classifiedTitle}>CLASIFICADO</Typography>
              <Typography className={styles.classifiedName}>{classifiedEffect.playerName}</Typography>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>

    <AnimatePresence>
      {victoryEffect ? (
        <motion.div
          key={victoryEffect.id}
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className={styles.victoryBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.55, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: "easeOut" }}
          />
          {centerShards.map((shard, index) => (
            <motion.span
              key={`${victoryEffect.id}-victory-${index}`}
              className={styles.centerSpark}
              style={{ background: index % 2 === 0 ? "#f4c542" : "#b7ff00" }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.3, 1.1, 0.5],
                x: [0, Math.cos((shard.angle * Math.PI) / 180) * 90],
                y: [0, Math.sin((shard.angle * Math.PI) / 180) * 90]
              }}
              transition={{ duration: 0.9, delay: index * 0.02, ease: "easeOut" }}
            />
          ))}
          <div className={styles.midCenter}>
            <motion.div
              className={styles.victoryBadge}
              initial={{ opacity: 0, scale: 0.84, y: 12 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.84, 1.08, 1, 0.94], y: [12, 0, 0, -8] }}
              transition={{ duration: 1.05, ease: "easeOut" }}
            >
              <Typography className={styles.victoryTitle}>VICTORIA</Typography>
              <Typography className={styles.victoryName}>{victoryEffect.playerName}</Typography>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>

    <AnimatePresence>
      {resetEffect ? (
        <motion.div
          key={resetEffect.id}
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.resetBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
          <div className={styles.resetCenter}>
            <motion.div
              className={styles.resetBadge}
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: [0, 1, 0.92, 0], scale: [0.86, 1, 1.04, 0.96] }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              Reset de puntuación
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  </>
);
