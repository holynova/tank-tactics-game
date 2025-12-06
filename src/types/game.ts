export type PlayerColor = 'red' | 'blue';

export interface Piece {
  id: string;
  color: PlayerColor;
  r: number;
  c: number;
  angle: number;
}

export type Grid = (Piece | null)[][];

export type GameMode = 'pvp' | 'pve';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DiceResult {
  red: number;
  blue: number;
}

export type GamePhase = 'lobby' | 'rolling' | 'playing' | 'gameover';

export interface Projectile {
  id: number;
  from: { r: number; c: number };
  to: { r: number; c: number };
}

export interface Explosion {
  id: number;
  r: number;
  c: number;
}
