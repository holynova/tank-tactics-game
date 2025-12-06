import { Trophy, Zap, Bot, Users } from 'lucide-react';

import { GameMode, Difficulty, DiceResult, PlayerColor } from '../../types/game';

interface LobbyOverlayProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  onStart: () => void;
}

export const LobbyOverlay = ({ gameMode, setGameMode, difficulty, setDifficulty, onStart }: LobbyOverlayProps) => (
  <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-lg p-6 text-center space-y-6">
    <div>
      <h2 className="text-2xl font-bold mb-2 text-white">装甲战术</h2>
      <p className="text-gray-400 text-sm">选择你的战场指挥方式</p>
    </div>
    
    <div className="grid grid-cols-2 gap-4 w-full">
      <button 
        onClick={() => setGameMode('pvp')} 
        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
          gameMode === 'pvp' 
            ? 'border-green-500 bg-green-500/20 text-white' 
            : 'border-gray-600 hover:bg-white/5 text-gray-400'
        }`}
      >
        <Users size={32} /><span className="font-bold">双人对战</span>
      </button>
      <button 
        onClick={() => setGameMode('pve')} 
        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
          gameMode === 'pve' 
            ? 'border-purple-500 bg-purple-500/20 text-white' 
            : 'border-gray-600 hover:bg-white/5 text-gray-400'
        }`}
      >
        <Bot size={32} /><span className="font-bold">人机对战</span>
      </button>
    </div>

    {gameMode === 'pve' && (
      <div className="w-full space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">AI 难度</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'easy', label: '简单', color: 'text-green-400', border: 'border-green-500/50' },
            { id: 'medium', label: '普通', color: 'text-yellow-400', border: 'border-yellow-500/50' },
            { id: 'hard', label: '困难', color: 'text-red-400', border: 'border-red-500/50' }
          ].map(level => (
            <button
              key={level.id}
              onClick={() => setDifficulty(level.id as Difficulty)}
              className={`py-2 rounded-lg border text-sm font-bold transition-all ${
                difficulty === level.id 
                  ? `${level.border} bg-white/10 ${level.color}` 
                  : 'border-gray-700 text-gray-500 hover:bg-white/5'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>
    )}

    <button 
      onClick={onStart} 
      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-bold text-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
    >
      <Zap /> 开始游戏
    </button>
  </div>
);

interface RollingOverlayProps {
  diceResult: DiceResult;
}

export const RollingOverlay = ({ diceResult }: RollingOverlayProps) => (
  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-lg">
    <div className="flex gap-12 text-center">
      <div><div className="text-5xl font-black text-red-500">{diceResult.red}</div>红方</div>
      <div><div className="text-5xl font-black text-blue-500">{diceResult.blue}</div>蓝方</div>
    </div>
  </div>
);

interface GameOverOverlayProps {
  winner: PlayerColor | null;
  onRestart: () => void;
}

export const GameOverOverlay = ({ winner, onRestart }: GameOverOverlayProps) => (
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-lg animate-in fade-in zoom-in">
    <Trophy size={64} className="text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
    <h2 className="text-4xl font-black text-white mb-2 tracking-widest uppercase">
      {winner === 'red' ? '红方' : '蓝方'} 胜利
    </h2>
    <button 
      onClick={onRestart} 
      className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
    >
      返回大厅
    </button>
  </div>
);
