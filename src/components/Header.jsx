import React from 'react';
import { RefreshCw, Volume2, VolumeX, HelpCircle } from 'lucide-react';

const Header = ({ 
  theme, 
  gameMode, 
  soundEnabled, 
  onToggleSound, 
  onToggleTheme, 
  onShowRules, 
  onReset 
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4 z-10">
      <div>
        <h1 className="text-3xl font-bold tracking-wider flex items-center gap-2">
          {theme.icon} {theme.name}
        </h1>
        <p className="text-gray-400 text-xs mt-1">
          模式: {gameMode === 'pvp' ? 'PvP' : 'PvE'} | 拥挤保护: 开启
        </p>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={onToggleSound} 
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20" 
          title="音效"
        >
          {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
        </button>
        <button 
          onClick={onShowRules}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600/80 hover:bg-blue-500 rounded-lg text-sm backdrop-blur-sm shadow-lg shadow-blue-900/50"
        >
          <HelpCircle size={14} /> 游戏规则
        </button>
        <button 
          onClick={onToggleTheme}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm backdrop-blur-sm"
        >
          <RefreshCw size={14} /> 主题
        </button>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 bg-red-600/80 hover:bg-red-500 rounded-lg text-sm backdrop-blur-sm shadow-lg shadow-red-900/50"
        >
          <RefreshCw size={14} /> 重置
        </button>
      </div>
    </div>
  );
};

export default Header;
