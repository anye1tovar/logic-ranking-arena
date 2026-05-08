import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import SportsEsportsRounded from "@mui/icons-material/SportsEsportsRounded";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import type { EventData } from "../../types/ranking";
import styles from "./admin-panel.module.scss";

type Props = {
  event: EventData;
  onUpdateEvent: (input: { title: string; subtitle?: string }) => void;
  onAddPlayer: (input: { name: string }) => void;
  onResetScores: () => void;
  onResetEvent: () => void;
};

export const AdminPanel = ({
  event,
  onUpdateEvent,
  onAddPlayer,
  onResetScores,
  onResetEvent
}: Props) => {
  const [title, setTitle] = useState(event.title);
  const [subtitle, setSubtitle] = useState(event.subtitle ?? "");
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    setTitle(event.title);
    setSubtitle(event.subtitle ?? "");
  }, [event.subtitle, event.title]);

  return (
    <Paper className={styles.panel}>
      <Typography className={styles.panelTitle} variant="h4">
        Mission Control
      </Typography>
      <Stack className={styles.stack}>
        <div className={styles.row}>
          <Typography variant="h6">Evento</Typography>
          <TextField label="Título del torneo" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth />
          <TextField label="Subtítulo" value={subtitle} onChange={(event) => setSubtitle(event.target.value)} fullWidth />
          <Button
            variant="contained"
            startIcon={<SaveRounded />}
            onClick={() => onUpdateEvent({ title, subtitle })}
          >
            Guardar identidad
          </Button>
        </div>
        <div className={styles.row}>
          <Typography variant="h6">Agregar jugador</Typography>
          <div className={styles.split}>
            <TextField
              label="Nombre"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && playerName.trim()) {
                  onAddPlayer({ name: playerName });
                  setPlayerName("");
                }
              }}
              fullWidth
            />
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SportsEsportsRounded />}
              onClick={() => {
                if (!playerName.trim()) return;
                onAddPlayer({ name: playerName });
                setPlayerName("");
              }}
            >
              Lanzar a la arena
            </Button>
          </div>
        </div>
        <div className={styles.row}>
          <Typography variant="h6">Acciones rápidas</Typography>
          <div className={styles.quickActions}>
            <Button variant="outlined" color="warning" startIcon={<RestartAltRounded />} onClick={onResetScores}>
              Reiniciar puntajes
            </Button>
            <Button variant="outlined" color="error" startIcon={<RestartAltRounded />} onClick={onResetEvent}>
              Reiniciar evento completo
            </Button>
          </div>
        </div>
      </Stack>
    </Paper>
  );
};
