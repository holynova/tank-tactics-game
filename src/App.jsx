import React, { useState, useEffect, useRef, useMemo } from 'react';

// Components
import { Header, BattleLog, RulesModal, StatusBar } from './components';
import { LobbyOverlay, RollingOverlay, GameOverOverlay } from './components/overlays/GameOverlays';

// Hooks
import { useSound } from './hooks/useSound';
import { findBestMove } from './hooks/useBotAI';

// Rules
import { checkEatingCondition, buildGrid } from './rules/eatingRules';
import { getValidMoves, getRotationAngle } from './rules/movementRules';
import { checkWinCondition } from './rules/winCondition';

// Constants
import { SIZE, ANIM_DURATION_ROTATE, ANIM_DURATION_MOVE, ANIM_DURATION_PROJECTILE } from './constants/gameConfig';
import { THEMES } from './constants/themes';
import { getUnitAsset, ProjectileAsset } from './constants/assets';

const App = () => {
  // --- State ---
  const [pieces, setPieces] = useState([]);
  const [turn, setTurn] = useState('red'); // 'red' or 'blue'
  const [selectedId, setSelectedId] = useState(null);
  const [phase, setPhase] = useState('lobby'); // lobby, rolling, playing, gameover
  const [diceResult, setDiceResult] = useState({ red: 0, blue: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [winner, setWinner] = useState(null);
  const [projectiles, setProjectiles] = useState([]);
  const [explosions, setExplosions] = useState([]); // {id, r, c}
  const [lastMovePos, setLastMovePos] = useState(null);
  const [themeKey, setThemeKey] = useState('land');
  const [showRules, setShowRules] = useState(false);
  const [gameMode, setGameMode] = useState('pvp'); // 'pvp' or 'pve'
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- Hooks ---
  const { playSound, initSoundContext } = useSound(soundEnabled);
  const logsEndRef = useRef(null);

  // --- Derived State ---
  const theme = THEMES[themeKey];
  const boardGrid = useMemo(() => buildGrid(pieces), [pieces]);

  // --- Game Logic ---

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  const initGame = () => {
    const initialPieces = [];
    // Red (Top)
    for (let i = 0; i < SIZE; i++) {
      initialPieces.push({ id: `r-${i}`, color: 'red', r: 0, c: i, angle: 180 });
    }
    // Blue (Bottom)
    for (let i = 0; i < SIZE; i++) {
      initialPieces.push({ id: `b-${i}`, color: 'blue', r: SIZE - 1, c: i, angle: 0 });
    }
    setPieces(initialPieces);
    setTurn('red'); // Default, will be set by dice
    setLogs(['>>> 游戏初始化完成', '>>> 请掷骰子决定先手']);
    setWinner(null);
    setPhase('lobby');
    setDiceResult({ red: 0, blue: 0 });
    setSelectedId(null);
    setLastMovePos(null);
    setExplosions([]);
    setProjectiles([]);
  };

  const triggerExplosion = (r, c) => {
    const id = Date.now() + Math.random();
    setExplosions(prev => [...prev, { id, r, c }]);
    setTimeout(() => {
        setExplosions(prev => prev.filter(e => e.id !== id));
    }, 1000);
  };

  const checkWin = (currentPieces) => {
    const { hasWinner, winner: newWinner } = checkWinCondition(currentPieces);
    if (hasWinner) {
      setWinner(newWinner);
      setPhase('gameover');
      addLog(`>>> 🏆 ${newWinner === 'red' ? '红方' : '蓝方'} 胜利！`);
      // playSound('win'); // Optional: Add win sound if available
    } else {
      setTurn(prev => prev === 'red' ? 'blue' : 'red');
      setIsAnimating(false);
    }
  };

  const performTurn = async (pieceId, toR, toC) => {
    setIsAnimating(true);
    setSelectedId(null);
    const piece = pieces.find(p => p.id === pieceId);
    
    // 1. ROTATE
    const targetAngle = getRotationAngle(piece.r, piece.c, toR, toC);
    if (targetAngle !== piece.angle) {
        playSound('turret');
        setPieces(prev => prev.map(p => p.id === pieceId ? { ...p, angle: targetAngle } : p));
        await new Promise(r => setTimeout(r, ANIM_DURATION_ROTATE));
    }
  
    // 2. MOVE
    playSound('motor');
    setPieces(prev => prev.map(p => p.id === pieceId ? { ...p, r: toR, c: toC } : p));
    setLastMovePos({ r: toR, c: toC });
    await new Promise(r => setTimeout(r, ANIM_DURATION_MOVE));
  
    // 3. CHECK EATING
    // Build temp grid for logic
    const tempGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
    const nextPieces = pieces.map(p => p.id === pieceId ? { ...p, r: toR, c: toC, angle: targetAngle } : p);
    nextPieces.forEach(p => tempGrid[p.r][p.c] = p);
  
    const { eatenPieces, attackers } = checkEatingCondition(tempGrid, toR, toC, piece.color);
  
    if (eatenPieces.length > 0) {
        // 4. PREPARE ATTACK (Rotate Attackers)
        const victim = eatenPieces[0]; // Usually just one victim in 2v1
        let rotatedAttackers = false;
        
        const newPiecesState = nextPieces.map(p => {
            if (attackers.find(a => a.id === p.id)) {
                const angle = getRotationAngle(p.r, p.c, victim.r, victim.c);
                if (angle !== p.angle) rotatedAttackers = true;
                return { ...p, angle };
            }
            return p;
        });
  
        if (rotatedAttackers) {
             playSound('turret');
             setPieces(newPiecesState);
             await new Promise(r => setTimeout(r, ANIM_DURATION_ROTATE));
        } else {
             setPieces(newPiecesState);
        }
  
        // 5. FIRE ANIMATION (Projectiles)
        playSound('fire');
        const newProjectiles = attackers.map(atk => ({
            id: Date.now() + atk.id,
            from: { r: atk.r, c: atk.c },
            to: { r: victim.r, c: victim.c }
        }));
        setProjectiles(newProjectiles);
        
        await new Promise(r => setTimeout(r, ANIM_DURATION_PROJECTILE));
        setProjectiles([]); // Clear projectiles
  
        // 6. EXPLOSION & REMOVE
        playSound('explode');
        triggerExplosion(victim.r, victim.c);
        
        const survivedPieces = newPiecesState.filter(p => !eatenPieces.some(e => e.id === p.id));
        setPieces(survivedPieces);
        
        addLog(`>>> 💥 ${piece.color === 'red' ? '红方' : '蓝方'} 集火摧毁敌军！`);
        
        checkWin(survivedPieces);
    } else {
        checkWin(nextPieces);
    }
  };

  const handleCellClick = (r, c) => {
    if (phase !== 'playing' || winner || isAnimating) return;
    // PvE: Player cannot move Red (Bot)
    if (gameMode === 'pve' && turn === 'red') return;
  
    // First time interaction enables sound context
    initSoundContext();
  
    const clickedPiece = boardGrid[r][c];
    const selectedPiece = pieces.find(p => p.id === selectedId);
  
    if (clickedPiece && clickedPiece.color === turn) {
        if (selectedId === clickedPiece.id) {
            setSelectedId(null);
        } else {
            playSound('click');
            setSelectedId(clickedPiece.id);
        }
        return;
    }
  
    if (selectedPiece && !clickedPiece) {
        const validMoves = getValidMoves(selectedPiece.r, selectedPiece.c, boardGrid);
        if (validMoves.some(m => m.r === r && m.c === c)) {
            performTurn(selectedId, r, c);
        } else {
            setSelectedId(null);
        }
        return;
    }
  
    if (clickedPiece && clickedPiece.color !== turn) {
        addLog(`>>> ⚠️ 只能操作自己的棋子`);
    }
  };

  const finishRolling = (finalResult) => {
    setPhase('playing');
    if (finalResult.red > finalResult.blue) {
      setTurn('red');
      addLog('>>> 🎲 红方点数大，红方先手');
    } else if (finalResult.blue > finalResult.red) {
      setTurn('blue');
      addLog('>>> 🎲 蓝方点数大，蓝方先手');
    } else {
      addLog('>>> 🎲 点数相同，重掷...');
      setTimeout(rollDice, 1000);
    }
  };

  const rollDice = () => {
    if (phase === 'rolling') return;
    playSound('click');
    setPhase('rolling');
    let count = 0;
    const interval = setInterval(() => {
      const newResult = {
        red: Math.ceil(Math.random() * 6),
        blue: Math.ceil(Math.random() * 6)
      };
      setDiceResult(newResult);
      playSound('dice');
      count++;
      if (count > 10) {
        clearInterval(interval);
        finishRolling(newResult);
      }
    }, 100);
  };

  // --- Effects ---

  // Bot Logic
  useEffect(() => {
    // Bot plays as Red in PvE
    if (phase === 'playing' && gameMode === 'pve' && turn === 'red' && !winner && !isAnimating) {
      const timer = setTimeout(() => {
        const depthMap = { easy: 1, medium: 2, hard: 3 };
        const depth = depthMap[difficulty] || 2;
        
        const move = findBestMove(pieces, boardGrid, depth, 'red');
        if (move) {
          performTurn(move.pieceId, move.to.r, move.to.c);
        } else {
          // No moves available? Pass turn to avoid stuck
          setTurn('blue');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, turn, winner, isAnimating, gameMode, pieces, boardGrid, difficulty]);

  // Init Game on Mount
  useEffect(() => {
    initGame();
  }, []);

  // --- Render ---

  return (
    <div className="w-full h-screen bg-[#0f0f0f] text-white flex flex-col transition-colors duration-500 font-sans select-none overflow-hidden" style={{ background: '#0f0f0f' }}>
      
      {/* Header */}
      <Header 
        theme={theme}
        gameMode={gameMode}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onToggleTheme={() => setThemeKey(t => t === 'land' ? 'sea' : 'land')}
        onShowRules={() => setShowRules(true)}
        onReset={initGame}
      />

      <div className="flex flex-col lg:flex-row gap-4 w-full h-[calc(100vh-120px)] items-center justify-center px-4">
        
        {/* Center: Game Board Area */}
        <div className="relative group flex-1 flex flex-col items-center justify-center gap-6">
          
          {/* Status Bar */}
          <StatusBar 
            turn={turn}
            winner={winner}
            isAnimating={isAnimating}
            gameMode={gameMode}
            unitType={theme.unitType}
          />

          {/* The Board Container */}
          <div 
            className={`relative p-3 rounded-xl shadow-2xl ${theme.board} border-4 ${theme.gridLines}`}
            style={{ boxShadow: '0 20px 50px -12px rgba(0,0,0,0.7)' }}
          >
            {/* The Game Area */}
            <div className="relative" style={{ width: 'min(90vw, min(calc(100vh - 250px), 700px))', height: 'min(90vw, min(calc(100vh - 250px), 700px))' }}>
                
                {/* Layer 1: Grid Background */}
                <div className="absolute inset-0 grid grid-cols-4 gap-2">
                    {Array(SIZE).fill(null).map((_, r) => (
                        Array(SIZE).fill(null).map((_, c) => {
                            const selectedP = pieces.find(p => p.id === selectedId);
                            const isValidMove = selectedP && !boardGrid[r][c] && getValidMoves(selectedP.r, selectedP.c, boardGrid).some(m => m.r === r && m.c === c);
                            const isLastMove = lastMovePos?.r === r && lastMovePos?.c === c;

                            let cursorStyle = 'cursor-default';
                            const hasOwnPiece = boardGrid[r][c] && boardGrid[r][c].color === turn;
                            if (!isAnimating && (isValidMove || (hasOwnPiece && (gameMode === 'pvp' || turn === 'red')))) {
                                cursorStyle = 'cursor-pointer';
                            }
                            if (gameMode === 'pve' && turn === 'blue') cursorStyle = 'cursor-wait';

                            return (
                                <div 
                                    key={`cell-${r}-${c}`}
                                    onClick={() => handleCellClick(r, c)}
                                    className={`
                                        aspect-square rounded-lg transition-colors duration-200 relative
                                        ${theme.cell} ${cursorStyle}
                                        ${isValidMove ? 'ring-4 ring-green-400/50 bg-green-500/20' : ''}
                                        ${isLastMove ? 'bg-yellow-500/20 ring-2 ring-yellow-500/30' : ''}
                                    `}
                                >
                                    {/* Explosion */}
                                    {explosions.some(e => e.r === r && e.c === c) && (
                                        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                                            <div className="relative w-full h-full animate-ping bg-orange-500 rounded-full opacity-75"></div>
                                            <div className="absolute text-5xl animate-bounce drop-shadow-lg">💥</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ))}
                </div>

                {/* Layer 2: Projectiles */}
                <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
                    {projectiles.map(p => {
                         // Calculate CSS variables for projectile flight
                         const startX = p.from.c * 25 + 12.5; 
                         const startY = p.from.r * 25 + 12.5;
                         const endX = p.to.c * 25 + 12.5;
                         const endY = p.to.r * 25 + 12.5;
                         
                         return (
                             <div 
                                key={p.id}
                                className="absolute w-4 h-4 -ml-2 -mt-2"
                                style={{
                                    left: '0%', top: '0%',
                                    '--sx': `${startX}%`, '--sy': `${startY}%`,
                                    '--ex': `${endX}%`, '--ey': `${endY}%`,
                                    animation: `projectileFlight ${ANIM_DURATION_PROJECTILE}ms linear forwards`
                                }}
                             >
                                 <ProjectileAsset />
                             </div>
                         )
                    })}
                </div>

                {/* Layer 3: Pieces */}
                <div className="absolute inset-0 pointer-events-none z-20">
                    {pieces.map((p) => {
                        const isSelected = selectedId === p.id;
                        return (
                            <div
                                key={p.id}
                                className="absolute transition-all ease-in-out flex items-center justify-center"
                                style={{
                                    width: '25%', height: '25%',
                                    top: `${p.r * 25}%`, left: `${p.c * 25}%`,
                                    transform: `rotate(${p.angle}deg)`,
                                    transitionDuration: `${isAnimating ? (p.angle % 90 === 0 ? ANIM_DURATION_ROTATE : ANIM_DURATION_MOVE) : 300}ms`
                                }}
                            >
                                <div className={`w-[80%] h-[80%] transition-transform duration-200 ${isSelected ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]' : ''}`}>
                                    {getUnitAsset(theme.unitType, p.color)}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>

            {/* Global Styles for Keyframes */}
            <style>{`
                @keyframes projectileFlight {
                    0% { left: var(--sx); top: var(--sy); transform: scale(0.5); }
                    50% { transform: scale(1.5); }
                    100% { left: var(--ex); top: var(--ey); transform: scale(0.5); }
                }
            `}</style>

            {/* Overlays */}
            {phase === 'gameover' && (
              <GameOverOverlay winner={winner} onRestart={initGame} />
            )}

            {phase === 'lobby' && (
              <LobbyOverlay 
                gameMode={gameMode} 
                setGameMode={setGameMode} 
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                onStart={rollDice} 
              />
            )}
            
            {phase === 'rolling' && (
               <RollingOverlay diceResult={diceResult} />
            )}
          </div>
        </div>

        {/* Right: Battle Log Sidebar */}
        <BattleLog logs={logs} />

      </div>

      {/* Game Rules Modal */}
      {showRules && (
        <RulesModal onClose={() => setShowRules(false)} />
      )}
    </div>
  );
}

export default App;