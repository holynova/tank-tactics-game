/**
 * Check win condition
 * @param {Array<Object>} pieces - Current pieces on board
 * @returns {{hasWinner: boolean, winner: string|null}}
 */
export const checkWinCondition = (pieces) => {
  const redCount = pieces.filter(p => p.color === 'red').length;
  const blueCount = pieces.filter(p => p.color === 'blue').length;

  if (redCount <= 1) {
    return { hasWinner: true, winner: 'blue' };
  } else if (blueCount <= 1) {
    return { hasWinner: true, winner: 'red' };
  }
  
  return { hasWinner: false, winner: null };
};
