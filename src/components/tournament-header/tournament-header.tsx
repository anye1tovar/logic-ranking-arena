import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import PeopleAltRounded from "@mui/icons-material/PeopleAltRounded";
import TimerRounded from "@mui/icons-material/TimerRounded";
import { Chip, Stack, Typography } from "@mui/material";

import type { EventData, Player } from "../../types/ranking";
import styles from "./tournament-header.module.scss";

type Props = {
  event: EventData;
  players: Player[];
  mode: "admin" | "viewer";
};

export const TournamentHeader = ({ event, players, mode }: Props) => {
  const champion = players.find((player) => player.status === "champion");

  return (
    <header className={styles.header}>
      <Typography className={styles.eyebrow}>
        {mode === "admin" ? "Control Booth" : "Live Arena"}
      </Typography>
      <div className={styles.titleRow}>
        <div>
          <Typography className={styles.title} variant="h1">
            {event.title}
          </Typography>
          <Typography className={styles.subtitle}>
            {event.subtitle || "Ranking dinámico en tiempo real"}
          </Typography>
        </div>
        <Stack className={styles.meta} direction="row">
          <Chip icon={<PeopleAltRounded />} label={`${players.length} jugadores`} color="secondary" />
          <Chip icon={<TimerRounded />} label="Sync local en vivo" variant="outlined" />
          {champion ? (
            <Chip icon={<EmojiEventsRounded />} label={champion.name} color="warning" />
          ) : null}
        </Stack>
      </div>
    </header>
  );
};
