import { getValidMoves, buildGrid } from '../rules';
import { checkEatingCondition } from '../rules/eatingRules';

/**
 * Bot AI logic for making automated moves
 * @param {Array<Object>} pieces - Current pieces on board
 * @param {Array<Array<Object|null>>} boardGrid - Current board grid
 * @returns {{pieceId: string, from: Object, to: Object}|null} Best move or null if no moves available
 */
export const findBestMove = (pieces, boardGrid) => {
  const bluePieces = pieces.filter(p => p.color === 'blue');
  if (bluePieces.length === 0) return null;

  let allMoves = [];
  bluePieces.forEach(p => {
    const moves = getValidMoves(p.r, p.c, boardGrid);
    moves.forEach(to => {
      allMoves.push({ pieceId: p.id, from: p, to });
    });
  });

  if (allMoves.length === 0) return null;

  let bestMove = null;
  let maxEaten = 0;
  
  // Shuffle for variety
  allMoves.sort(() => Math.random() - 0.5);

  for (const move of allMoves) {
    // Simulate the move
    const simGrid = boardGrid.map(row => row.map(cell => cell ? {...cell} : null));
    simGrid[move.from.r][move.from.c] = null;
    simGrid[move.to.r][move.to.c] = { ...move.from, color: 'blue' };
    
    const { eatenPieces } = checkEatingCondition(simGrid, move.to.r, move.to.c, 'blue');
    if (eatenPieces.length > maxEaten) {
      maxEaten = eatenPieces.length;
      bestMove = move;
    }
  }

  // If no eating opportunity, pick any valid move
  if (!bestMove) bestMove = allMoves[0];
  
  return bestMove;
};
