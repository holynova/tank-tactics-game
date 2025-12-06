import { SIZE } from '../constants/gameConfig';
import { Grid } from '../types/game';

/**
 * Get the rotation angle based on movement direction
 */
export const getRotationAngle = (r1: number, c1: number, r2: number, c2: number): number => {
  if (r2 < r1) return 0;   // Up
  if (r2 > r1) return 180; // Down
  if (c2 < c1) return 270; // Left
  if (c2 > c1) return 90;  // Right
  return 0;
};

/**
 * Get valid moves for a piece at given position
 */
export const getValidMoves = (r: number, c: number, grid: Grid): { r: number; c: number }[] => {
  const moves: { r: number; c: number }[] = [];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  dirs.forEach(([dr, dc]) => {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
      if (!grid[nr][nc]) {
        moves.push({ r: nr, c: nc });
      }
    }
  });
  
  return moves;
};
