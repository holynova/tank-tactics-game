import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, RefreshCw, Trophy, Anchor, Target, Zap, Bot, Users, Swords, Volume2, VolumeX, HelpCircle, X } from 'lucide-react';

// --- Sound Engine (Web Audio API) ---
const soundEngine = {
  ctx: null,
  init: () => {
    if (!soundEngine.ctx) {
      soundEngine.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (soundEngine.ctx.state === 'suspended') {
      soundEngine.ctx.resume();
    }
  },
  playTone: (freq = 440, type = 'sine', duration = 0.1, vol = 0.1) => {
    if (!soundEngine.ctx) return;
    const osc = soundEngine.ctx.createOscillator();
    const gain = soundEngine.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, soundEngine.ctx.currentTime);
    gain.gain.setValueAtTime(vol, soundEngine.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, soundEngine.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(soundEngine.ctx.destination);
    osc.start();
    osc.stop(soundEngine.ctx.currentTime + duration);
  },
  playMotor: () => {
    // 模拟引擎声：低频震动 + 履带轰鸣
    if (!soundEngine.ctx) return;
    const t = soundEngine.ctx.currentTime;
    const duration = 0.8; // 稍微延长一点声音持续时间

    // 1. 引擎核心低频 (Engine Hum)
    // 使用两个稍微失谐的锯齿波产生拍频 (Beating effect)
    const osc1 = soundEngine.ctx.createOscillator();
    const osc2 = soundEngine.ctx.createOscillator();
    const gainEngine = soundEngine.ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    
    // 频率包络：启动 -> 稳定 -> 停止
    osc1.frequency.setValueAtTime(45, t);
    osc1.frequency.linearRampToValueAtTime(60, t + 0.2);
    osc1.frequency.linearRampToValueAtTime(40, t + duration);

    osc2.frequency.setValueAtTime(48, t); // 稍微失谐
    osc2.frequency.linearRampToValueAtTime(63, t + 0.2);
    osc2.frequency.linearRampToValueAtTime(43, t + duration);

    gainEngine.gain.setValueAtTime(0.1, t);
    gainEngine.gain.linearRampToValueAtTime(0.15, t + 0.2);
    gainEngine.gain.exponentialRampToValueAtTime(0.01, t + duration);

    osc1.connect(gainEngine);
    osc2.connect(gainEngine);
    gainEngine.connect(soundEngine.ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(t + duration);
    osc2.stop(t + duration);

    // 2. 履带轰鸣 (Track Rumble - Filtered Noise)
    const bufferSize = soundEngine.ctx.sampleRate * duration;
    const buffer = soundEngine.ctx.createBuffer(1, bufferSize, soundEngine.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        // 棕色噪声/粉红噪声近似 (简单的随机游走或积分)
        // 这里用简单的白噪声 + 低通滤波模拟
        data[i] = Math.random() * 2 - 1;
    }

    const noise = soundEngine.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = soundEngine.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(120, t);
    noiseFilter.frequency.linearRampToValueAtTime(200, t + 0.3); // 移动时频率略微上升
    noiseFilter.frequency.linearRampToValueAtTime(100, t + duration);

    const noiseGain = soundEngine.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, t);
    noiseGain.gain.linearRampToValueAtTime(0.2, t + 0.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(soundEngine.ctx.destination);
    
    noise.start();
  },
  playTurret: () => {
    // 机械摩擦声
    if (!soundEngine.ctx) return;
    const osc = soundEngine.ctx.createOscillator();
    const gain = soundEngine.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, soundEngine.ctx.currentTime);
    gain.gain.setValueAtTime(0.03, soundEngine.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, soundEngine.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(soundEngine.ctx.destination);
    osc.start();
    osc.stop(soundEngine.ctx.currentTime + 0.2);
  },
  playFire: () => {
    // 开炮：噪音 + 冲击
    if (!soundEngine.ctx) return;
    const t = soundEngine.ctx.currentTime;
    
    // 冲击部分
    const osc = soundEngine.ctx.createOscillator();
    const oscGain = soundEngine.ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    oscGain.gain.setValueAtTime(0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(oscGain);
    oscGain.connect(soundEngine.ctx.destination);
    osc.start();
    osc.stop(t + 0.3);

    // 噪音部分 (模拟爆炸气流)
    const bufferSize = soundEngine.ctx.sampleRate * 0.5;
    const buffer = soundEngine.ctx.createBuffer(1, bufferSize, soundEngine.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = soundEngine.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = soundEngine.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    noise.connect(noiseGain);
    noiseGain.connect(soundEngine.ctx.destination);
    noise.start();
  },
  playExplosion: () => {
    // 爆炸：低频噪音
    if (!soundEngine.ctx) return;
    const t = soundEngine.ctx.currentTime;
    const bufferSize = soundEngine.ctx.sampleRate * 1.0;
    const buffer = soundEngine.ctx.createBuffer(1, bufferSize, soundEngine.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = soundEngine.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Lowpass filter
    const filter = soundEngine.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    const gain = soundEngine.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(soundEngine.ctx.destination);
    noise.start();
  }
};

// --- Assets & Constants ---
const ASSETS = {
  tank: (color) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-lg ${color === 'red' ? 'text-red-600' : 'text-blue-600'}`} style={{ pointerEvents: 'none' }}>
      <rect x="15" y="10" width="15" height="80" rx="4" fill="#222" />
      <rect x="70" y="10" width="15" height="80" rx="4" fill="#222" />
      <path d="M15 20 H30 M15 30 H30 M15 40 H30 M15 50 H30 M15 60 H30 M15 70 H30" stroke="#444" strokeWidth="2" />
      <path d="M70 20 H85 M70 30 H85 M70 40 H85 M70 50 H85 M70 60 H85 M70 70 H85" stroke="#444" strokeWidth="2" />
      <rect x="25" y="20" width="50" height="60" rx="8" fill="currentColor" />
      <rect x="30" y="25" width="40" height="50" rx="4" fill="rgba(0,0,0,0.2)" />
      <circle cx="50" cy="55" r="18" fill={color === 'red' ? '#7f1d1d' : '#1e3a8a'} stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
      <rect x="44" y="0" width="12" height="55" rx="2" fill={color === 'red' ? '#7f1d1d' : '#1e3a8a'} />
      <rect x="44" y="0" width="12" height="10" rx="1" fill="#111" /> 
    </svg>
  ),
  ship: (color) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-lg ${color === 'red' ? 'text-red-600' : 'text-blue-600'}`} style={{ pointerEvents: 'none' }}>
      <path d="M50 5 L80 25 L80 85 C80 95 50 100 50 100 C50 100 20 95 20 85 L20 25 Z" fill="currentColor" />
      <rect x="45" y="25" width="10" height="60" fill="rgba(0,0,0,0.3)" />
      <circle cx="50" cy="55" r="15" fill="rgba(255,255,255,0.3)" />
      <rect x="42" y="35" width="16" height="20" fill="#333" />
      <rect x="46" y="10" width="8" height="35" fill="#333" />
    </svg>
  ),
  projectile: () => (
    <svg viewBox="0 0 20 20" className="w-full h-full">
        <circle cx="10" cy="10" r="8" fill="black" />
        <circle cx="8" cy="8" r="3" fill="white" opacity="0.5"/>
    </svg>
  )
};

const THEMES = {
  land: {
    name: '陆战风云',
    bg: 'bg-stone-800',
    board: 'bg-[#5d5848]',
    cell: 'bg-[#76715e] border-[#4a4638]',
    gridLines: 'border-stone-600',
    icon: <Target className="w-5 h-5" />,
    unitType: 'tank',
    ground: 'from-stone-800 to-stone-900'
  },
  sea: {
    name: '怒海争锋',
    bg: 'bg-slate-900',
    board: 'bg-[#1e3a8a]',
    cell: 'bg-[#2563eb] bg-opacity-20 border-[#60a5fa]',
    gridLines: 'border-blue-400/30',
    icon: <Anchor className="w-5 h-5" />,
    unitType: 'ship',
    ground: 'from-slate-900 to-blue-950'
  }
};

const SIZE = 4;
const ANIM_DURATION_ROTATE = 300;
const ANIM_DURATION_MOVE = 500;
const ANIM_DURATION_PROJECTILE = 600;

export default function Game() {
  const [pieces, setPieces] = useState([]);
  const [turn, setTurn] = useState(null); 
  const [phase, setPhase] = useState('lobby'); 
  const [gameMode, setGameMode] = useState('pvp'); 
  const [selectedId, setSelectedId] = useState(null); 
  const [winner, setWinner] = useState(null);
  const [theme, setTheme] = useState('land');
  const [logs, setLogs] = useState([]);
  const [diceResult, setDiceResult] = useState({ red: 0, blue: 0 });
  const [lastMovePos, setLastMovePos] = useState(null); 
  const [explosions, setExplosions] = useState([]); 
  const [isAnimating, setIsAnimating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  
  // Projectiles: { id, from: {r,c}, to: {r,c}, delay }
  const [projectiles, setProjectiles] = useState([]); 

  const logsEndRef = useRef(null);

  const boardGrid = useMemo(() => {
    const grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
    pieces.forEach(p => {
      grid[p.r][p.c] = p;
    });
    return grid;
  }, [pieces]);

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // AI Logic
  useEffect(() => {
    if (phase === 'playing' && gameMode === 'pve' && turn === 'blue' && !winner && !isAnimating) {
      const timer = setTimeout(() => {
        makeBotMove();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, turn, gameMode, winner, isAnimating, pieces]);

  const initGame = () => {
    const initialPieces = [];
    for (let c = 0; c < SIZE; c++) {
        initialPieces.push({ id: `b-${c}`, color: 'blue', r: 0, c: c, angle: 180 });
    }
    for (let c = 0; c < SIZE; c++) {
        initialPieces.push({ id: `r-${c}`, color: 'red', r: 3, c: c, angle: 0 });
    }
    
    setPieces(initialPieces);
    setPhase('lobby');
    setTurn(null);
    setWinner(null);
    setLogs(['>>> 游戏准备就绪', '>>> 战场静默中...']);
    setLastMovePos(null);
    setExplosions([]);
    setProjectiles([]);
    setSelectedId(null);
    setIsAnimating(false);
  };

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  const playSound = (type) => {
    if (!soundEnabled) return;
    soundEngine.init();
    if (type === 'click') soundEngine.playTone(600, 'sine', 0.05, 0.05);
    if (type === 'motor') soundEngine.playMotor();
    if (type === 'turret') soundEngine.playTurret();
    if (type === 'fire') soundEngine.playFire();
    if (type === 'explode') soundEngine.playExplosion();
  };

  const rollDice = () => {
    if (phase === 'rolling') return;
    playSound('click');
    setPhase('rolling');
    let count = 0;
    const interval = setInterval(() => {
      setDiceResult({
        red: Math.ceil(Math.random() * 6),
        blue: Math.ceil(Math.random() * 6)
      });
      soundEngine.playTone(800 + Math.random()*200, 'triangle', 0.05, 0.05);
      count++;
      if (count > 10) {
        clearInterval(interval);
        finishRolling();
      }
    }, 100);
  };

  const finishRolling = () => {
    const r = Math.ceil(Math.random() * 6);
    const b = Math.ceil(Math.random() * 6);
    if (r === b) { finishRolling(); return; }

    setDiceResult({ red: r, blue: b });
    const first = r > b ? 'red' : 'blue';
    setTurn(first);
    setPhase('playing');
    addLog(`>>> 掷骰结果: 红${r} - 蓝${b}，${first === 'red' ? '红方' : '蓝方'}先手`);
    playSound('click');
  };

  // --- Logic Helpers ---

  const getRotationAngle = (r1, c1, r2, c2) => {
    if (r2 < r1) return 0;   // Up
    if (r2 > r1) return 180; // Down
    if (c2 < c1) return 270; // Left
    if (c2 > c1) return 90;  // Right
    return 0; // Default
  };

  // Advanced Eating Logic: Returns details about attackers and victims
  const checkEatingCondition = (currentGrid, lastR, lastC, attackerColor) => {
    let result = { eatenPieces: [], attackers: [] };
    
    // Helper to check one line
    const scanLine = (lineArr, isRow, lineIndex) => {
      // 1. Crowding Protection: If line has > 3 pieces, NO EATING.
      const pieceCount = lineArr.filter(p => p !== null).length;
      if (pieceCount > 3) return;

      const victimColor = attackerColor === 'red' ? 'blue' : 'red';
      
      for (let i = 0; i < SIZE - 2; i++) {
        const p1 = lineArr[i];
        const p2 = lineArr[i+1];
        const p3 = lineArr[i+2];
        if (!p1 || !p2 || !p3) continue;

        const pattern = [p1.color, p2.color, p3.color].join('');
        
        let victim = null;
        let localAttackers = [];

        // Pattern A-A-V
        if (pattern === `${attackerColor}${attackerColor}${victimColor}`) {
           victim = p3;
           localAttackers = [p1, p2];
        } 
        // Pattern V-A-A
        else if (pattern === `${victimColor}${attackerColor}${attackerColor}`) {
           victim = p1;
           localAttackers = [p2, p3];
        }

        if (victim) {
            // Check protection (neighbors)
            // Note: We scan the temp grid so positions are logical
            // Need to know victim's index in this line to check neighbors
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

    scanLine(currentGrid[lastR], true, lastR);
    const colArr = currentGrid.map(row => row[lastC]);
    scanLine(colArr, false, lastC);

    // Remove duplicates from attackers (a piece might attack in both row and col?)
    // Unlikely in 4x4 with 2-1 rule, but good practice.
    result.attackers = [...new Set(result.attackers)];
    return result;
  };

  const getValidMoves = (r, c, grid = boardGrid) => {
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

  // --- Bot Logic ---
  const makeBotMove = () => {
    const bluePieces = pieces.filter(p => p.color === 'blue');
    if (bluePieces.length === 0) return;

    let allMoves = [];
    bluePieces.forEach(p => {
      const moves = getValidMoves(p.r, p.c, boardGrid);
      moves.forEach(to => {
        allMoves.push({ pieceId: p.id, from: p, to });
      });
    });

    if (allMoves.length === 0) {
        addLog(">>> 🤖 电脑无路可走，跳过回合。");
        setTurn('red');
        return; 
    }

    let bestMove = null;
    let maxEaten = 0;
    allMoves.sort(() => Math.random() - 0.5);

    for (const move of allMoves) {
        const simGrid = boardGrid.map(row => row.map(cell => cell ? {...cell} : null));
        simGrid[move.from.r][move.from.c] = null;
        simGrid[move.to.r][move.to.c] = { ...simGrid[move.from.r][move.from.c], color: 'blue' };
        
        const { eatenPieces } = checkEatingCondition(simGrid, move.to.r, move.to.c, 'blue');
        if (eatenPieces.length > maxEaten) {
            maxEaten = eatenPieces.length;
            bestMove = move;
        }
    }

    if (!bestMove) bestMove = allMoves[0];
    performTurn(bestMove.pieceId, bestMove.to.r, bestMove.to.c);
  };

  const handleCellClick = (r, c) => {
    if (phase !== 'playing' || winner || isAnimating) return;
    if (gameMode === 'pve' && turn === 'blue') return;

    // First time interaction enables sound context
    soundEngine.init();

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

  // --- MAIN ANIMATION SEQUENCE ---
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
            // Even if no rotation needed, update state to be sure
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

  const checkWin = (currentPieces) => {
    const redCount = currentPieces.filter(p => p.color === 'red').length;
    const blueCount = currentPieces.filter(p => p.color === 'blue').length;

    if (redCount <= 1) {
        setWinner('blue');
        setPhase('gameover');
        addLog('>>> 🏆 蓝方胜利！');
    } else if (blueCount <= 1) {
        setWinner('red');
        setPhase('gameover');
        addLog('>>> 🏆 红方胜利！');
    } else {
        setTurn(prev => prev === 'red' ? 'blue' : 'red');
        setIsAnimating(false);
    }
  };

  const triggerExplosion = (r, c) => {
    const id = Date.now() + Math.random();
    setExplosions(prev => [...prev, { id, r, c }]);
    setTimeout(() => {
        setExplosions(prev => prev.filter(e => e.id !== id));
    }, 1000);
  };

  const currentTheme = THEMES[theme];

  return (
    <div className="w-full h-screen bg-[#0f0f0f] text-white flex flex-col transition-colors duration-500 font-sans select-none overflow-hidden" style={{ background: '#0f0f0f' }}>
      
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4 z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-wider flex items-center gap-2">
            {currentTheme.icon} {currentTheme.name}
          </h1>
          <p className="text-gray-400 text-xs mt-1">
             模式: {gameMode === 'pvp' ? 'PvP' : 'PvE'} | 拥挤保护: 开启
          </p>
        </div>
        
        <div className="flex gap-2">
           <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20" title="音效">
             {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
           </button>
           <button 
            onClick={() => setShowRules(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm"
            title="游戏规则"
          >
            <HelpCircle size={16} />
          </button>
           <button 
            onClick={() => setTheme(t => t === 'land' ? 'sea' : 'land')}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm backdrop-blur-sm"
          >
            <RefreshCw size={14} /> 主题
          </button>
          <button 
            onClick={initGame}
            className="flex items-center gap-2 px-3 py-2 bg-red-600/80 hover:bg-red-500 rounded-lg text-sm backdrop-blur-sm shadow-lg shadow-red-900/50"
          >
            <RefreshCw size={14} /> 重置
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full h-[calc(100vh-120px)] items-center justify-center px-4">
        
        {/* Center: Game Board Area */}
        <div className="relative group flex-1 flex items-center justify-center">
          
          {/* Status Bar */}
          <div className="absolute -top-14 left-0 w-full flex justify-between items-center px-2">
             <div className={`transition-all duration-300 ${turn === 'blue' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>
                <span className="text-blue-400 font-bold flex items-center gap-2">
                   {gameMode === 'pve' ? <Bot size={20}/> : <Users size={20}/>}
                   {currentTheme.unitType === 'tank' ? '蓝军' : '蓝方舰队'}
                   {turn === 'blue' && !winner && <span className="animate-pulse text-xs bg-blue-500/20 px-2 py-0.5 rounded">
                     {isAnimating ? '行动中...' : '思考中'}
                   </span>}
                </span>
             </div>
             <div className="text-2xl font-black text-white/20 px-4 bg-black/20 rounded-full">
                {gameMode === 'pve' ? <Swords size={20}/> : 'VS'}
             </div>
             <div className={`transition-all duration-300 ${turn === 'red' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>
                <span className="text-red-400 font-bold flex items-center gap-2">
                    {turn === 'red' && !winner && <span className="animate-pulse text-xs bg-red-500/20 px-2 py-0.5 rounded">
                       {isAnimating ? '行动中...' : '请行动'}
                    </span>}
                    {currentTheme.unitType === 'tank' ? '红军' : '红方舰队'}
                    <Users size={20}/>
                </span>
             </div>
          </div>

          {/* The Board Container */}
          <div 
            className={`relative p-3 rounded-xl shadow-2xl ${currentTheme.board} border-4 ${currentTheme.gridLines}`}
            style={{ boxShadow: '0 20px 50px -12px rgba(0,0,0,0.7)' }}
          >
            {/* The Game Area */}
            <div className="relative" style={{ width: 'min(90vw, min(90vh, 700px))', height: 'min(90vw, min(90vh, 700px))' }}>
                
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
                                        ${currentTheme.cell} ${cursorStyle}
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
                         // From center of start to center of end
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
                                 {ASSETS.projectile()}
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
                                    transitionDuration: `${isAnimating ? (p.angle % 90 === 0 ? ANIM_DURATION_ROTATE : ANIM_DURATION_MOVE) : 300}ms` // dynamic logic tricky here, relying on step sequence
                                }}
                            >
                                <div className={`w-[80%] h-[80%] transition-transform duration-200 ${isSelected ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]' : ''}`}>
                                    {p.color === 'red' 
                                        ? (currentTheme.unitType === 'tank' ? ASSETS.tank('red') : ASSETS.ship('red'))
                                        : (currentTheme.unitType === 'tank' ? ASSETS.tank('blue') : ASSETS.ship('blue'))
                                    }
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
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-lg animate-in fade-in zoom-in">
                <Trophy size={64} className="text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                <h2 className="text-4xl font-black text-white mb-2 tracking-widest uppercase">
                  {winner === 'red' ? '红方' : '蓝方'} 胜利
                </h2>
                <button onClick={initGame} className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
                  返回大厅
                </button>
              </div>
            )}

            {phase === 'lobby' && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-lg p-6 text-center space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2 text-white">装甲战术</h2>
                    <p className="text-gray-400 text-sm">选择你的战场指挥方式</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    <button onClick={() => setGameMode('pvp')} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gameMode === 'pvp' ? 'border-green-500 bg-green-500/20 text-white' : 'border-gray-600 hover:bg-white/5 text-gray-400'}`}>
                        <Users size={32} /><span className="font-bold">双人对战</span>
                    </button>
                    <button onClick={() => setGameMode('pve')} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gameMode === 'pve' ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-gray-600 hover:bg-white/5 text-gray-400'}`}>
                        <Bot size={32} /><span className="font-bold">人机对战</span>
                    </button>
                </div>
                <button onClick={rollDice} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-bold text-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                    <Zap /> 开始游戏
                </button>
              </div>
            )}
            
            {phase === 'rolling' && (
               <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-lg">
                  <div className="flex gap-12 text-center">
                    <div><div className="text-5xl font-black text-red-500">{diceResult.red}</div>红方</div>
                    <div><div className="text-5xl font-black text-blue-500">{diceResult.blue}</div>蓝方</div>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Right: Battle Log Sidebar */}
        <div className="w-full lg:w-80 lg:h-full h-48 bg-black/40 rounded-xl border border-white/20 backdrop-blur flex flex-col overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="font-bold flex items-center gap-2"><Sparkles size={16} className="text-yellow-400" /> 战场日志</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs font-mono scrollbar-hide">
            {logs.map((log, i) => (
              <div key={i} className={`p-2 rounded border-l-2 ${log.includes('红') ? 'border-red-500 bg-red-500/10' : log.includes('蓝') ? 'border-blue-500 bg-blue-500/10' : 'border-gray-500 bg-gray-500/10'}`}>
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

      </div>

      {/* Game Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-white/10 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <HelpCircle className="text-blue-400" /> 游戏规则说明
              </h2>
              <button onClick={() => setShowRules(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 text-gray-200">
              <section>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Target className="text-green-400" size={20} /> 游戏目标
                </h3>
                <p className="leading-relaxed">
                  消灭敌方部队，直到对方只剩下1个单位或更少。红方和蓝方轮流行动，先手通过掷骰子决定。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="text-yellow-400" size={20} /> 基本规则
                </h3>
                <ul className="space-y-2 list-disc list-inside leading-relaxed">
                  <li><strong>移动：</strong>每回合选择一个己方单位，移动到相邻的空格（上下左右）</li>
                  <li><strong>旋转：</strong>单位移动前会自动转向移动方向</li>
                  <li><strong>集火攻击：</strong>满足特定条件时，己方可以消灭敌方单位</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Swords className="text-red-400" size={20} /> 集火机制
                </h3>
                <p className="leading-relaxed mb-3">
                  当己方移动后，在<strong>同一行或同一列</strong>形成以下模式之一时，可以消灭敌方单位：
                </p>
                <div className="bg-black/30 rounded-lg p-4 space-y-2 font-mono text-sm">
                  <div>✅ <span className="text-red-400">己方</span> - <span className="text-red-400">己方</span> - <span className="text-blue-400">敌方</span> （两己夹敌，右侧）</div>
                  <div>✅ <span className="text-blue-400">敌方</span> - <span className="text-red-400">己方</span> - <span className="text-red-400">己方</span> （两己夹敌，左侧）</div>
                </div>
                <p className="leading-relaxed mt-3">
                  <strong className="text-yellow-300">注意：</strong>需要连续的3个单位，中间不能有空格！
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-purple-400">🛡️</span> 保护机制
                </h3>
                <ul className="space-y-2 list-disc list-inside leading-relaxed">
                  <li><strong>友军保护：</strong>如果被夹击的敌方单位旁边有己方单位（同行/列），则不会被消灭</li>
                  <li><strong>拥挤保护：</strong>如果某行或某列有超过3个单位，该行/列不会触发集火</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Bot className="text-purple-400" size={20} /> 游戏模式
                </h3>
                <ul className="space-y-2 list-disc list-inside leading-relaxed">
                  <li><strong>双人对战 (PvP)：</strong>红蓝双方由玩家控制</li>
                  <li><strong>人机对战 (PvE)：</strong>蓝方由电脑控制，红方由玩家控制</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-3">💡 策略提示</h3>
                <ul className="space-y-2 list-disc list-inside leading-relaxed">
                  <li>尽量保持单位分散，避免被对方集火</li>
                  <li>主动创造 2v1 的夹击局面</li>
                  <li>利用保护机制，让队友相邻站位</li>
                  <li>注意拥挤保护：有时聚集也是一种防御策略</li>
                </ul>
              </section>
            </div>

            <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur border-t border-white/10 p-4">
              <button 
                onClick={() => setShowRules(false)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold transition-all"
              >
                开始游戏
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}