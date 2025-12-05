import React, { useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const BattleLog = ({ logs }) => {
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="w-full lg:w-80 lg:h-full h-48 bg-black/40 rounded-xl border border-white/20 backdrop-blur flex flex-col overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-400" /> 战场日志
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs font-mono scrollbar-hide">
        {logs.map((log, i) => (
          <div 
            key={i} 
            className={`p-2 rounded border-l-2 ${
              log.includes('红') 
                ? 'border-red-500 bg-red-500/10' 
                : log.includes('蓝') 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-500 bg-gray-500/10'
            }`}
          >
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default BattleLog;
