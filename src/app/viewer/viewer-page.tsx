import { Typography } from "@mui/material";
import { useEffect } from "react";

import { Leaderboard } from "../../components/leaderboard/leaderboard";
import stylesShell from "../../components/shared/shell.module.scss";
import { TournamentHeader } from "../../components/tournament-header/tournament-header";
import { useRankingStore } from "../../store/ranking-store";
import styles from "./viewer-page.module.scss";

export const ViewerPage = () => {
  const event = useRankingStore((state) => state.event);
  const players = useRankingStore((state) => state.players);
  const clearFlashes = useRankingStore((state) => state.clearFlashes);

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

  return (
    <main className={`${stylesShell.pageShell} ${styles.viewerShell}`}>
      <div className={`${stylesShell.contentGrid} ${styles.viewerGrid}`}>
        <TournamentHeader event={event} players={players} mode="viewer" />
        <Typography className={styles.viewerHint}>
          Vista pública lista para fullscreen, TV o proyector
        </Typography>
        <Leaderboard players={players} />
      </div>
    </main>
  );
};
