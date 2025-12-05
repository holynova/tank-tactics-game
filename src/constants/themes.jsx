import { Target, Anchor } from 'lucide-react';

export const THEMES = {
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
