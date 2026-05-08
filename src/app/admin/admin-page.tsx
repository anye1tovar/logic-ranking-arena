import { Pagination, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { AdminPanel } from "../../components/admin-panel/admin-panel";
import { Leaderboard } from "../../components/leaderboard/leaderboard";
import { TournamentHeader } from "../../components/tournament-header/tournament-header";
import { useRankingStore } from "../../store/ranking-store";
import stylesShell from "../../components/shared/shell.module.scss";
import styles from "./admin-page.module.scss";

export const AdminPage = () => {
  const pageSize = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
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
    clearFlashes,
  } = useRankingStore();

  useEffect(() => {
    const timeouts = players.flatMap((player) =>
      player.scoreFlashes.map((flash) =>
        window.setTimeout(
          () => clearFlashes(player.id),
          Math.max(0, 850 - (Date.now() - flash.createdAt)),
        ),
      ),
    );

    return () => {
      timeouts.forEach(window.clearTimeout);
    };
  }, [clearFlashes, players]);

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("es-CO");
  const filteredPlayers = useMemo(
    () =>
      normalizedSearch
        ? players.filter((player) =>
            player.name.toLocaleLowerCase("es-CO").includes(normalizedSearch),
          )
        : players,
    [normalizedSearch, players],
  );
  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedPlayers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredPlayers.slice(start, start + pageSize);
  }, [filteredPlayers, safePage]);

  useEffect(() => {
    setPage(1);
  }, [normalizedSearch]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
            <div className={styles.rankingHeader}>
              <Typography variant="h4">Ranking Live</Typography>
              <TextField
                className={styles.searchBox}
                label="Buscar por nombre"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ej. Camilo"
                size="small"
              />
            </div>
            <div className={styles.rankingMeta}>
              <Typography className={styles.resultsCount}>
                {filteredPlayers.length} jugador
                {filteredPlayers.length === 1 ? "" : "es"}
                {normalizedSearch ? " encontrado(s)" : " en ranking"}
              </Typography>
            </div>
            <Leaderboard
              players={paginatedPlayers}
              admin
              rankOffset={(safePage - 1) * pageSize}
              emptyTitle={
                players.length === 0 ? undefined : "No hay coincidencias"
              }
              emptyDescription={
                players.length === 0
                  ? undefined
                  : "Prueba con otro nombre o limpia el buscador para ver todos los jugadores."
              }
              onAddPoint={changePoints}
              onAddWin={addWin}
              onSetStatus={setStatus}
              onRemove={removePlayer}
            />
            {filteredPlayers.length > pageSize ? (
              <div className={styles.pagination}>
                <Pagination
                  count={totalPages}
                  page={safePage}
                  onChange={(_, nextPage) => setPage(nextPage)}
                  color="primary"
                  shape="rounded"
                  size="large"
                />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
};
