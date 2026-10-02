import { CSSProperties } from 'react';
import { Piece, PlayerColor, Projectile, Explosion, Grid } from '../../types/game';
import { ThemeKey, THEMES, FACTIONS } from '../../constants/themes';
import { art, unitImage } from '../../constants/assets';
import { getValidMoves } from '../../rules/movementRules';
import { ANIM_DURATION_MOVE, ANIM_DURATION_ROTATE, ANIM_DURATION_PROJECTILE } from '../../constants/gameConfig';

export type Motion = { id: string; stage: 'turning' | 'driving' } | null;
interface Props {
  pieces: Piece[]; grid: Grid; theme: ThemeKey; selected: string | null; turn: PlayerColor;
  busy: boolean; motion: Motion; firing: string[]; projectiles: Projectile[];
  explosions: Explosion[]; lastMove: {r: number; c: number} | null;
  interactive: boolean; onCell: (r: number, c: number) => void;
}
export default function BattleBoard(p: Props) {
  const type = THEMES[p.theme].unitType;
  const selected = p.pieces.find(unit => unit.id === p.selected);
  const moves = selected ? getValidMoves(selected.r, selected.c, p.grid) : [];
  return <div className={`board-frame ${p.explosions.length ? 'impact-shake' : ''}`}>
    <div className="board-topline"><span>战区 / {THEMES[p.theme].codename}</span><span>04 × 04</span></div>
    <div className={`battlefield ${p.theme}`} aria-label="战术棋盘" data-testid="battlefield">
      <div className="battlefield-surface">
        <div className="terrain" style={{ backgroundImage: `url(${art(`terrain-${p.theme}`)})` }} />
        {p.theme === 'sea' && <div className="sea-shimmer" />}
      </div>
      <div className="cell-grid">
        {Array.from({length: 16}, (_, index) => {
          const r = Math.floor(index / 4), c = index % 4, unit = p.grid[r][c];
          const valid = moves.some(m => m.r === r && m.c === c);
          const own = unit?.color === p.turn;
          return <button key={index} data-testid={`cell-${r}-${c}`}
            aria-label={`${'ABCD'[r]}${c + 1} ${unit ? FACTIONS[unit.color].name + '单位' : '空地'}${valid ? ' 可移动' : ''}`}
            aria-pressed={!!unit && unit.id === p.selected}
            disabled={!p.interactive || p.busy || (!own && !valid)}
            onClick={() => p.onCell(r,c)}
            className={`board-cell ${valid ? 'valid-move' : ''} ${unit?.id === p.selected ? 'selected-cell' : ''} ${p.lastMove?.r === r && p.lastMove?.c === c ? 'last-move' : ''}`}>
            <span className="cell-coordinate">{'ABCD'[r]}{c+1}</span>
            {valid && <span className="move-marker" />}
          </button>;
        })}
      </div>
      <div className="unit-layer" aria-hidden="true">
        {p.pieces.map(unit => {
          const driving = p.motion?.id === unit.id && p.motion.stage === 'driving';
          const shooting = p.firing.includes(unit.id);
          return <div key={unit.id} data-unit={unit.id} data-moving={driving}
            className={`unit-position ${unit.color} ${driving ? 'driving' : ''}`}
            style={{top: `${unit.r*25}%`, left: `${unit.c*25}%`,
              transitionDuration: `${ANIM_DURATION_MOVE}ms`}}>
            <div className="unit-rotator" style={{ transform: `rotate(${unit.angle}deg)`, transitionDuration: `${ANIM_DURATION_ROTATE}ms` }}>
              {type === 'ship' && <img className={`ship-wake ${driving ? 'active' : ''}`} src={art('fx-wake')} alt="" />}
              {type === 'tank' && driving && <div className="drive-dust">{[0,1,2].map(i=><i key={i} style={{backgroundImage:`url(${art('fx-dust')})`}}/>)}</div>}
              <div className={`unit-body ${type} ${driving ? 'suspension' : ''} ${shooting ? 'recoil' : ''}`}>
                {type === 'tank' ? <><div className={`tank-sprite ${driving ? 'track-cycle' : ''} ${shooting ? 'cut-barrel' : ''}`}
                  style={{backgroundImage: `url(${art(`tank-${unit.color}-drive`)})`}}/>
                  {shooting && <div className="barrel-sprite" style={{backgroundImage:`url(${art(`tank-${unit.color}-drive`)})`}}/>}</>
                  : <img className="unit-image" src={unitImage(type, unit.color)} alt="" draggable={false}/>}
              </div>
              {shooting && <><div className="muzzle-glow"/><div className="muzzle-sprite" style={{backgroundImage:`url(${art('fx-muzzle')})`}}/></>}
            </div>
            <span className="unit-number">{unit.id.split('-')[1]}</span>
          </div>;
        })}
      </div>
      <div className="effect-layer" aria-hidden="true">
        {p.projectiles.map(shot => {
          const dx = shot.to.c-shot.from.c, dy = shot.to.r-shot.from.r;
          const len = Math.hypot(dx,dy);
          return <div key={shot.id} className="projectile" style={{
            '--sx': `${shot.from.c*25+12.5+dx/len*8}%`,
            '--sy': `${shot.from.r*25+12.5+dy/len*8}%`,
            '--ex': `${shot.to.c*25+12.5}%`, '--ey': `${shot.to.r*25+12.5}%`,
            '--heading': `${Math.atan2(dy,dx)*180/Math.PI}deg`,
            animationDuration: `${ANIM_DURATION_PROJECTILE}ms`
          } as CSSProperties}><div className="shell-light"><img src={art('fx-shell')} alt=""/><i/></div></div>;
        })}
        {p.explosions.map(blast => <div key={blast.id} className={`blast ${p.theme}`}
          style={{left: `${blast.c*25}%`, top: `${blast.r*25}%`}}>
          <div className="impact-light"/><div className="shockwave"/>
          <div className="blast-sprite" style={{backgroundImage:`url(${art(p.theme === 'sea' ? 'fx-splash' : 'fx-explosion')})`}}/>
          {Array.from({length:8},(_,i)=><i className="spark" key={i} style={{'--a':`${i*45}deg`} as CSSProperties}/>)}
        </div>)}
      </div>
    </div>
    <div className="board-bottomline"><span>A — D / 1 — 4</span><span>友军保护 · 拥挤保护</span></div>
  </div>;
}
