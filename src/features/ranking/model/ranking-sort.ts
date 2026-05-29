import type { Player, PlayerStatus } from "./types";

const statusWeight: Record<PlayerStatus, number> = {
	champion: 4,
	classified: 3,
	active: 2,
	eliminated: 1,
};

export const sortPlayers = (players: Player[]) =>
	[...players].sort((a, b) => {
		if (b.points !== a.points) return b.points - a.points;
		if (b.wins !== a.wins) return b.wins - a.wins;
		if (statusWeight[b.status] !== statusWeight[a.status]) {
			return statusWeight[b.status] - statusWeight[a.status];
		}
		return b.updatedAt - a.updatedAt;
	});

export const statusLabel: Record<PlayerStatus, string> = {
	active: "En juego",
	classified: "Clasificado",
	eliminated: "Eliminado",
	champion: "Champion",
};

export const statusTone: Record<
	PlayerStatus,
	"default" | "success" | "warning"
> = {
	active: "default",
	classified: "success",
	eliminated: "default",
	champion: "warning",
};

export const medalForRank = (rank: number) => {
	if (rank === 0) return "🥇";
	if (rank === 1) return "🥈";
	if (rank === 2) return "🥉";
	return `${rank + 1}.`;
};

export const formatDelta = (value: number) =>
	value > 0 ? `+${value}` : `${value}`;
