import { Typography } from "@mui/material";
import { useEffect } from "react";

import { AdminPanel } from "../../components/admin-panel/admin-panel";
import { Leaderboard } from "../../components/leaderboard/leaderboard";
import { TournamentHeader } from "../../components/tournament-header/tournament-header";
import { useRankingStore } from "../../store/ranking-store";
import stylesShell from "../../components/shared/shell.module.scss";
import styles from "./admin-page.module.scss";

export const AdminPage = () => {
  const {
    event,
    players,
    updateEvent,
    addPlayer,
    resetScores,
    resetEvent,
    changePoints,
    addWin,
    setStatus,
    removePlayer,
    clearFlashes
  } = useRankingStore();

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
    <main className={stylesShell.pageShell}>
      <div className={stylesShell.contentGrid}>
        <TournamentHeader event={event} players={players} mode="admin" />
        <div className={styles.layout}>
          <div className={styles.sticky}>
            <AdminPanel
              event={event}
              onUpdateEvent={updateEvent}
              onAddPlayer={addPlayer}
              onResetScores={resetScores}
              onResetEvent={resetEvent}
            />
          </div>
          <section>
            <Typography variant="h4" sx={{ marginBottom: 2 }}>
              Ranking Live
            </Typography>
            <Leaderboard
              players={players}
              admin
              onAddPoint={changePoints}
              onAddWin={addWin}
              onSetStatus={setStatus}
              onRemove={removePlayer}
            />
          </section>
        </div>
      </div>
    </main>
  );
};
