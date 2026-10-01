import { PlayerColor, GameMode, Piece } from '../../types/game';
import { FACTIONS } from '../../constants/themes';
interface Props { turn: PlayerColor; isAnimating: boolean; gameMode: GameMode; pieces: Piece[]; action: string; turns: number }
export default function StatusBar(p: Props) {
  return <div className="combat-status" role="status">
    {(['red','blue'] as const).map(color=><div key={color} className={`team-status ${color} ${p.turn===color ? 'active' : ''}`}>
      <span className="team-dot"/><div><b>{FACTIONS[color].name}</b><small>{p.pieces.filter(u=>u.color===color).length} 单位 · {p.gameMode==='pve' ? color==='blue' ? '你' : '电脑' : color==='red' ? '红方' : '蓝方'}</small></div>
      {p.turn===color && <span className="turn-indicator">{p.isAnimating ? p.action : '行动回合'}</span>}
    </div>)}
    <span className="turn-counter">TURN {String(p.turns+1).padStart(2,'0')}</span>
  </div>;
}
