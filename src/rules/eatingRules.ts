import { SIZE } from '../constants/gameConfig';
import { Grid, Piece, PlayerColor } from '../types/game';

interface EatingResult {
  eatenPieces: Piece[];
  attackers: Piece[];
}

/**
 * Check eating condition and return details about attackers and victims
 * This is the core game rule for the 2v1 attack mechanism
 */
export const checkEatingCondition = (
  currentGrid: Grid,
  lastR: number,
  lastC: number,
  attackerColor: PlayerColor
): EatingResult => {
  let result: EatingResult = { eatenPieces: [], attackers: [] };
  
  const scanLine = (lineArr: (Piece | null)[]) => {
    // Crowding Protection: If line has > 3 pieces, NO EATING
    const pieceCount = lineArr.filter(p => p !== null).length;
    if (pieceCount > 3) return;

    const victimColor = attackerColor === 'red' ? 'blue' : 'red';
    
    for (let i = 0; i < SIZE - 2; i++) {
      const p1 = lineArr[i];
      const p2 = lineArr[i+1];
      const p3 = lineArr[i+2];
      if (!p1 || !p2 || !p3) continue;

      const pattern = [p1.color, p2.color, p3.color].join('');
      
      let victim: Piece | null = null;
      let localAttackers: Piece[] = [];

      // Pattern A-A-V (two attackers then victim)
      if (pattern === `${attackerColor}${attackerColor}${victimColor}`) {
        victim = p3;
        localAttackers = [p1, p2];
      } 
      // Pattern V-A-A (victim then two attackers)
      else if (pattern === `${victimColor}${attackerColor}${attackerColor}`) {
        victim = p1;
        localAttackers = [p2, p3];
      }

      if (victim) {
        // Check protection (neighbors of same color protect the victim)
        const vIdx = pattern === `${attackerColor}${attackerColor}${victimColor}` ? i + 2 : i;
        
        let isProtected = false;
        if (vIdx > 0 && lineArr[vIdx - 1]?.color === victimColor) isProtected = true;
        if (vIdx < SIZE - 1 && lineArr[vIdx + 1]?.color === victimColor) isProtected = true;

        if (!isProtected) {
          result.eatenPieces.push(victim);
          result.attackers.push(...localAttackers);
        }
      }
    }
  };

  // Scan the row where the move happened
  if (currentGrid[lastR]) {
    scanLine(currentGrid[lastR]);
  }
  
  // Scan the column where the move happened
  const colArr = currentGrid.map(row => row[lastC]);
  scanLine(colArr);

  // Remove duplicates from attackers
  result.attackers = [...new Set(result.attackers)];
  
  return result;
};

/**
 * Build a grid from pieces array
 */
export const buildGrid = (pieces: Piece[]): Grid => {
  const grid: Grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
  pieces.forEach(p => {
    grid[p.r][p.c] = p;
  });
  return grid;
};
