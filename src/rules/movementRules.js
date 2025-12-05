import { SIZE } from '../constants/gameConfig';

/**
 * Get the rotation angle based on movement direction
 * @param {number} r1 - Starting row
 * @param {number} c1 - Starting column
 * @param {number} r2 - Target row
 * @param {number} c2 - Target column
 * @returns {number} Rotation angle in degrees
 */
export const getRotationAngle = (r1, c1, r2, c2) => {
  if (r2 < r1) return 0;   // Up
  if (r2 > r1) return 180; // Down
  if (c2 < c1) return 270; // Left
  if (c2 > c1) return 90;  // Right
  return 0;
};

/**
 * Get valid moves for a piece at given position
 * @param {number} r - Current row
 * @param {number} c - Current column
 * @param {Array<Array<Object|null>>} grid - Current board grid
 * @returns {Array<{r: number, c: number}>} Array of valid move positions
 */
export const getValidMoves = (r, c, grid) => {
  const moves = [];
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
