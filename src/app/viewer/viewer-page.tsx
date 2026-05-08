import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { Leaderboard } from "../../components/leaderboard/leaderboard";
import stylesShell from "../../components/shared/shell.module.scss";
import { TournamentHeader } from "../../components/tournament-header/tournament-header";
import { ViewerEffectsLayer } from "../../components/viewer-effects/viewer-effects-layer";
import { useRankingStore } from "../../store/ranking-store";
import type { Player } from "../../types/ranking";
import type { PlayerEffectState } from "../../types/viewer-effects";
import styles from "./viewer-page.module.scss";

export const ViewerPage = () => {
  const { event, players, clearFlashes } = useRankingStore();
  const previousPlayersRef = useRef<Player[]>(players);
  const [championEffect, setChampionEffect] = useState<{ id: string; playerName: string } | null>(null);
  const [classifiedEffect, setClassifiedEffect] = useState<{ id: string; playerName: string } | null>(null);
  const [victoryEffect, setVictoryEffect] = useState<{ id: string; playerName: string } | null>(null);
  const [resetEffect, setResetEffect] = useState<{ id: string } | null>(null);
  const [playerEffects, setPlayerEffects] = useState<Record<string, PlayerEffectState>>({});

  useEffect(() => {
    const timeouts = players.flatMap((player) =>
      player.scoreFlashes.map((flash) =>
        window.setTimeout(() => clearFlashes(player.id), Math.max(0, 850 - (Date.now() - flash.createdAt)))
      )
    );

    return () => {
      timeouts.forEach(window.clearTimeout);
    };
  }, [clearFlashes, players]);

  useEffect(() => {
    const previousPlayers = previousPlayersRef.current;
    const previousMap = new Map(previousPlayers.map((player, index) => [player.id, { player, index }]));
    const nextEffects: Record<string, PlayerEffectState> = {};
    let nextChampion: { id: string; playerName: string } | null = null;
    let nextClassified: { id: string; playerName: string } | null = null;
    let nextVictory: { id: string; playerName: string } | null = null;

    players.forEach((player, index) => {
      const previousEntry = previousMap.get(player.id);
      const triggerBase = Date.now() + Math.random() + index;

      if (!previousEntry) {
        nextEffects[player.id] = {
          ...nextEffects[player.id],
          newPlayerTrigger: triggerBase
        };
        return;
      }

      const { player: previousPlayer, index: previousIndex } = previousEntry;
      const moveDelta = index - previousIndex;

      if (moveDelta !== 0) {
        nextEffects[player.id] = {
          ...nextEffects[player.id],
          moveTrigger: triggerBase + 0.1,
          moveDelta
        };
      }

      if (player.wins > previousPlayer.wins) {
        nextEffects[player.id] = {
          ...nextEffects[player.id],
          winTrigger: triggerBase + 0.2
        };
        nextVictory = {
          id: `${player.id}-victory-${triggerBase}`,
          playerName: player.name
        };
      }

      if (player.status !== previousPlayer.status) {
        if (player.status === "classified") {
          nextEffects[player.id] = {
            ...nextEffects[player.id],
            classifiedTrigger: triggerBase + 0.3
          };
          nextClassified = {
            id: `${player.id}-classified-${triggerBase}`,
            playerName: player.name
          };
        }

        if (player.status === "eliminated") {
          nextEffects[player.id] = {
            ...nextEffects[player.id],
            eliminatedTrigger: triggerBase + 0.4
          };
        }

        if (player.status === "champion") {
          nextEffects[player.id] = {
            ...nextEffects[player.id],
            championTrigger: triggerBase + 0.5
          };
          nextChampion = {
            id: `${player.id}-${triggerBase}`,
            playerName: player.name
          };
        }
      }
    });

    const previousTotalPoints = previousPlayers.reduce((sum, player) => sum + player.points, 0);
    const currentTotalPoints = players.reduce((sum, player) => sum + player.points, 0);
    const isReset =
      previousTotalPoints > 0 &&
      currentTotalPoints === 0 &&
      players.length > 0 &&
      players.every((player) => player.points === 0);

    previousPlayersRef.current = players;

    if (Object.keys(nextEffects).length > 0) {
      setPlayerEffects((current) => {
        const updated = { ...current };
        Object.entries(nextEffects).forEach(([id, effect]) => {
          updated[id] = {
            ...updated[id],
            ...effect
          };
        });
        return updated;
      });
    }

    if (nextChampion) {
      setVictoryEffect(null);
      setClassifiedEffect(null);
      setChampionEffect(nextChampion);
      const championTimeout = window.setTimeout(() => setChampionEffect(null), 2400);
      return () => window.clearTimeout(championTimeout);
    }

    if (nextClassified) {
      setClassifiedEffect(nextClassified);
      const classifiedTimeout = window.setTimeout(() => setClassifiedEffect(null), 1350);
      return () => window.clearTimeout(classifiedTimeout);
    }

    if (nextVictory) {
      setVictoryEffect(nextVictory);
      const victoryTimeout = window.setTimeout(() => setVictoryEffect(null), 1100);
      return () => window.clearTimeout(victoryTimeout);
    }

    if (isReset) {
      const effect = { id: `reset-${Date.now()}` };
      setResetEffect(effect);
      const resetTimeout = window.setTimeout(() => setResetEffect(null), 1100);
      return () => window.clearTimeout(resetTimeout);
    }
  }, [players]);

  return (
    <main className={`${stylesShell.pageShell} ${styles.viewerShell}`}>
      <ViewerEffectsLayer
        championEffect={championEffect}
        classifiedEffect={classifiedEffect}
        victoryEffect={victoryEffect}
        resetEffect={resetEffect}
      />
      <div className={`${stylesShell.contentGrid} ${styles.viewerGrid}`}>
        <TournamentHeader event={event} players={players} mode="viewer" />
        <Typography className={styles.viewerHint}>
          Vista pública lista para fullscreen, TV o proyector
        </Typography>
        <Leaderboard players={players} viewerMode playerEffects={playerEffects} />
      </div>
    </main>
  );
};
