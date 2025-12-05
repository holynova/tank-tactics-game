import React from 'react';
import { HelpCircle, X, Target, Zap, Swords, Bot } from 'lucide-react';

const RulesModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-white/10 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="text-blue-400" /> 游戏规则说明
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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
            <p className="leading-relaxed mb-4">
              当己方移动后，在<strong>同一行或同一列</strong>形成以下模式之一时，可以消灭敌方单位：
            </p>
            
            {/* Visual Example 1: Attack from Right */}
            <div className="mb-4">
              <div className="text-sm font-bold mb-2 text-green-300">✅ 模式1：右侧夹击</div>
              <div className="bg-black/40 rounded-lg p-4 border border-green-500/30">
                <div className="grid grid-cols-4 gap-2 w-48">
                  <div className="aspect-square bg-gray-700/50 rounded"></div>
                  <div className="aspect-square bg-red-600 rounded flex items-center justify-center text-xs">红</div>
                  <div className="aspect-square bg-red-600 rounded flex items-center justify-center text-xs">红</div>
                  <div className="aspect-square bg-blue-600 rounded flex items-center justify-center text-xs relative">
                    蓝
                    <div className="absolute -top-1 -right-1 text-orange-400 text-lg">💥</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">红方移动后形成两己夹敌，蓝方单位被消灭</div>
              </div>
            </div>

            {/* Visual Example 2: Attack from Left */}
            <div className="mb-4">
              <div className="text-sm font-bold mb-2 text-green-300">✅ 模式2：左侧夹击</div>
              <div className="bg-black/40 rounded-lg p-4 border border-green-500/30">
                <div className="grid grid-cols-4 gap-2 w-48">
                  <div className="aspect-square bg-blue-600 rounded flex items-center justify-center text-xs relative">
                    蓝
                    <div className="absolute -top-1 -right-1 text-orange-400 text-lg">💥</div>
                  </div>
                  <div className="aspect-square bg-red-600 rounded flex items-center justify-center text-xs">红</div>
                  <div className="aspect-square bg-red-600 rounded flex items-center justify-center text-xs">红</div>
                  <div className="aspect-square bg-gray-700/50 rounded"></div>
                </div>
                <div className="text-xs text-gray-400 mt-2">红方移动后形成两己夹敌，蓝方单位被消灭</div>
              </div>
            </div>

            {/* Invalid Example */}
            <div className="mb-3">
              <div className="text-sm font-bold mb-2 text-red-300">❌ 无效：中间有空格</div>
              <div className="bg-black/40 rounded-lg p-4 border border-red-500/30">
                <div className="grid grid-cols-4 gap-2 w-48">
                  <div className="aspect-square bg-red-600 rounded flex items-center justify-center text-xs">红</div>
                  <div className="aspect-square bg-gray-700/50 rounded"></div>
                  <div className="aspect-square bg-red-600 rounded flex items-center justify-center text-xs">红</div>
                  <div className="aspect-square bg-blue-600 rounded flex items-center justify-center text-xs">蓝</div>
                </div>
                <div className="text-xs text-gray-400 mt-2">中间有空格，不会触发集火</div>
              </div>
            </div>
            
            <p className="leading-relaxed mt-3 bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded">
              <strong className="text-yellow-300">注意：</strong>需要连续的3个单位，中间不能有空格！
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-purple-400">🛡️</span> 保护机制
            </h3>
            
            {/* Protection Example 1: Friendly Protection */}
            <div className="mb-4">
              <div className="text-sm font-bold mb-2 text-purple-300">✅ 友军保护</div>
              <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30">
                <div className="grid grid-cols-4 gap-2 w-48">
                  <div className="aspect-square bg-blue-600 rounded flex items-center justify-center text-xs">蓝</div>
                  <div className="aspect-square bg-red-600 rounded flex items-center justify-center text-xs">红</div>
                  <div className="aspect-square bg-red-600 rounded flex items-center justify-center text-xs">红</div>
                  <div className="aspect-square bg-blue-600 rounded flex items-center justify-center text-xs relative">
                    蓝
                    <div className="absolute -top-2 -right-2 text-green-400 text-lg">🛡️</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">右侧蓝方单位被左侧友军保护，不会被消灭</div>
              </div>
            </div>

            {/* Protection Example 2: Crowding Protection */}
            <div className="mb-3">
              <div className="text-sm font-bold mb-2 text-purple-300">✅ 拥挤保护</div>
              <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30">
                <div className="grid grid-cols-4 gap-2 w-48">
                  <div className="aspect-square bg-red-600 rounded flex items-center justify-center text-xs">红</div>
                  <div className="aspect-square bg-blue-600 rounded flex items-center justify-center text-xs">蓝</div>
                  <div className="aspect-square bg-red-600 rounded flex items-center justify-center text-xs">红</div>
                  <div className="aspect-square bg-blue-600 rounded flex items-center justify-center text-xs">蓝</div>
                </div>
                <div className="text-xs text-gray-400 mt-2">该行有4个单位，触发拥挤保护，不会集火</div>
              </div>
            </div>
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
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold transition-all"
          >
            开始游戏
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
