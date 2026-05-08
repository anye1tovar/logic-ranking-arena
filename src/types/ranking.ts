export type PlayerStatus = "active" | "classified" | "eliminated" | "champion";

export type EventData = {
  id: string;
  title: string;
  subtitle?: string;
  createdAt: number;
};

export type ScoreFlash = {
  id: string;
  value: number;
  createdAt: number;
};

export type Player = {
  id: string;
  name: string;
  points: number;
  wins: number;
  status: PlayerStatus;
  streak: number;
  updatedAt: number;
  scoreFlashes: ScoreFlash[];
};

export type RankingState = {
  event: EventData;
  players: Player[];
  updatedAt: number;
};

export type EventInput = {
  title: string;
  subtitle?: string;
};

export type PlayerInput = {
  name: string;
};
