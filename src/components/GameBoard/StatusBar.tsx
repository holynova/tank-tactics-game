import { Bot, Users, Swords } from 'lucide-react';

import { PlayerColor, GameMode } from '../../types/game';

interface StatusBarProps {
  turn: PlayerColor;
  winner: PlayerColor | null;
  isAnimating: boolean;
  gameMode: GameMode;
  unitType: 'tank' | 'ship';
}

const StatusBar = ({ turn, winner, isAnimating, gameMode, unitType }: StatusBarProps) => {
  return (
    <div className="flex justify-between items-center w-full max-w-[700px] px-4">
      {/* Blue Team */}
      <div className={`transition-all duration-300 ${turn === 'blue' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>
        <span className="text-blue-400 font-bold flex items-center gap-2">
          {gameMode === 'pve' ? <Bot size={20}/> : <Users size={20}/>}
          {unitType === 'tank' ? '蓝军' : '蓝方舰队'}
          {turn === 'blue' && !winner && (
            <span className="animate-pulse text-xs bg-blue-500/20 px-2 py-0.5 rounded">
              {isAnimating ? '行动中...' : '思考中'}
            </span>
          )}
        </span>
      </div>
      
      {/* VS */}
      <div className="text-2xl font-black text-white/20 px-4 bg-black/20 rounded-full">
        {gameMode === 'pve' ? <Swords size={20}/> : 'VS'}
      </div>
      
      {/* Red Team */}
      <div className={`transition-all duration-300 ${turn === 'red' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>
        <span className="text-red-400 font-bold flex items-center gap-2">
          {turn === 'red' && !winner && (
            <span className="animate-pulse text-xs bg-red-500/20 px-2 py-0.5 rounded">
              {isAnimating ? '行动中...' : '请行动'}
            </span>
          )}
          {unitType === 'tank' ? '红军' : '红方舰队'}
          <Users size={20}/>
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
