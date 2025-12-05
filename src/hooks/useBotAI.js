import { getValidMoves, buildGrid } from '../rules';
import { checkEatingCondition } from '../rules/eatingRules';
import { SIZE } from '../constants/gameConfig';

// --- Constants ---
const MAX_DEPTH = 3;
const SCORES = {
  WIN: 10000,
  LOSS: -10000,
  EAT: 100,
  LOSE: -100,
  CENTER: 10,
  DANGER: -50
};

/**
 * Evaluate the board state for the maximizing player
 */
const evaluateBoard = (pieces, turn, botColor) => {
  const botPieces = pieces.filter(p => p.color === botColor);
  const enemyPieces = pieces.filter(p => p.color !== botColor);

  // 1. Win/Loss Check
  if (enemyPieces.length <= 1) return SCORES.WIN;
  if (botPieces.length <= 1) return SCORES.LOSS;

  let score = 0;

  // 2. Material Score
  score += (botPieces.length - enemyPieces.length) * 100;

  // 3. Positional Score (Center Control)
  botPieces.forEach(p => {
    if (p.r >= 1 && p.r <= 2 && p.c >= 1 && p.c <= 2) {
      score += SCORES.CENTER;
    }
  });

  return score;
};

/**
 * Get all valid moves for a specific color
 */
const getAllValidMoves = (pieces, grid, color) => {
  const myPieces = pieces.filter(p => p.color === color);
  let allMoves = [];
  
  myPieces.forEach(p => {
    const moves = getValidMoves(p.r, p.c, grid);
    moves.forEach(to => {
      allMoves.push({ pieceId: p.id, from: p, to });
    });
  });
  
  // Shuffle to add some randomness for equal moves
  return allMoves.sort(() => Math.random() - 0.5);
};

/**
 * Simulate a move and return new pieces state
 */
const simulateMove = (pieces, move, color) => {
  // 1. Move
  let nextPieces = pieces.map(p => 
    p.id === move.pieceId ? { ...p, r: move.to.r, c: move.to.c } : p
  );

  // 2. Check Eating
  const grid = buildGrid(nextPieces);
  const { eatenPieces } = checkEatingCondition(grid, move.to.r, move.to.c, color);
  
  // 3. Remove Eaten
  if (eatenPieces.length > 0) {
    nextPieces = nextPieces.filter(p => !eatenPieces.some(e => e.id === p.id));
  }

  return nextPieces;
};

/**
 * Minimax with Alpha-Beta Pruning
 */
const minimax = (pieces, depth, alpha, beta, isMaximizing, botColor) => {
  const enemyColor = botColor === 'red' ? 'blue' : 'red';

  // Terminal state or max depth
  const botCount = pieces.filter(p => p.color === botColor).length;
  const enemyCount = pieces.filter(p => p.color === enemyColor).length;
  
  if (depth === 0 || botCount <= 1 || enemyCount <= 1) {
    return evaluateBoard(pieces, null, botColor);
  }

  const grid = buildGrid(pieces);

  if (isMaximizing) {
    // Bot Turn
    let maxEval = -Infinity;
    const moves = getAllValidMoves(pieces, grid, botColor);
    
    if (moves.length === 0) return evaluateBoard(pieces, null, botColor);

    for (const move of moves) {
      const nextPieces = simulateMove(pieces, move, botColor);
      const evalScore = minimax(nextPieces, depth - 1, alpha, beta, false, botColor);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Prune
    }
    return maxEval;
  } else {
    // Player Turn
    let minEval = Infinity;
    const moves = getAllValidMoves(pieces, grid, enemyColor);

    if (moves.length === 0) return evaluateBoard(pieces, null, botColor);

    for (const move of moves) {
      const nextPieces = simulateMove(pieces, move, enemyColor);
      const evalScore = minimax(nextPieces, depth - 1, alpha, beta, true, botColor);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Prune
    }
    return minEval;
  }
};

/**
 * Bot AI logic for making automated moves using Minimax
 * @param {Array<Object>} pieces - Current pieces on board
 * @param {Array<Array<Object|null>>} boardGrid - Current board grid
 * @param {number} depth - Search depth (Difficulty)
 * @param {string} botColor - Color of the bot ('red' or 'blue')
 * @returns {{pieceId: string, from: Object, to: Object}|null} Best move or null if no moves available
 */
export const findBestMove = (pieces, boardGrid, depth = 3, botColor = 'red') => {
  const moves = getAllValidMoves(pieces, boardGrid, botColor);
  if (moves.length === 0) return null;

  let bestMove = null;
  let bestValue = -Infinity;
  const alpha = -Infinity;
  const beta = Infinity;

  // Run Minimax for each root move
  for (const move of moves) {
    const nextPieces = simulateMove(pieces, move, botColor);
    // Start minimizing for opponent
    const moveValue = minimax(nextPieces, depth - 1, alpha, beta, false, botColor);
    
    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
  }

  return bestMove || moves[0];
};
