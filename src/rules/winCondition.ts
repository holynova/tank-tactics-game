import { Piece, PlayerColor } from '../types/game';

/**
 * Check win condition
 */
export const checkWinCondition = (pieces: Piece[]): { hasWinner: boolean; winner: PlayerColor | null } => {
  const redCount = pieces.filter(p => p.color === 'red').length;
  const blueCount = pieces.filter(p => p.color === 'blue').length;

  if (redCount <= 1) {
    return { hasWinner: true, winner: 'blue' };
  } else if (blueCount <= 1) {
    return { hasWinner: true, winner: 'red' };
  }
  
  return { hasWinner: false, winner: null };
};
