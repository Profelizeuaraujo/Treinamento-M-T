export type GameMode = 'mouse' | 'keyboard' | null;

export interface User {
  id: string;
  name: string;
}

export interface ScoreEntry {
  id: string;
  userId: string;
  userName: string;
  mode: 'mouse' | 'keyboard';
  score: number;
  date: string;
}
