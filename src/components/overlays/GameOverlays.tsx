import { GameMode, Difficulty, DiceResult, PlayerColor } from '../../types/game';
import { ThemeKey, THEMES, FACTIONS } from '../../constants/themes';
import { art, unitImage } from '../../constants/assets';

interface LobbyProps {
  gameMode: GameMode; setGameMode: (m: GameMode) => void; difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void; onStart: () => void; theme: ThemeKey;
  ready: boolean; error: string; onRetry: () => void;
}
export const LobbyOverlay = (p: LobbyProps) => <main className="home-page">
  <section className="hero-scene" style={{backgroundImage:`url(${art('scene-lobby')})`}}>
    <div className="scene-top"><span>FIELD OPERATIONS / 001</span><span>回合制 · 战术对抗</span></div>
    <div className="hero-copy"><p className="eyebrow">部署你的下一步</p><h1>方寸之间，<br/>决胜战场。</h1>
      <p>两支军团，十六格战场。每一次推进，都是一场博弈。</p></div>
  </section>
  <div className="home-bottom">
    <section className="mission-brief">
      <p className="eyebrow">交战双方 / COMBATANTS</p>
      <div className="faction-roster">
        {(['red','blue'] as const).map(color=><article className={`faction-card ${color}`} key={color}>
          <img src={unitImage(THEMES[p.theme].unitType,color)} alt={FACTIONS[color][THEMES[p.theme].unitType]}/>
          <div><small>{FACTIONS[color].code}</small><h2>{FACTIONS[color].name}</h2><p>{FACTIONS[color][THEMES[p.theme].unitType]}</p></div>
        </article>)}
      </div>
      <div className="brief-rules"><span>01 <b>相邻移动</b></span><span>02 <b>连续集火</b></span><span>03 <b>守护友军</b></span></div>
      <p className="brief-note">连续两个己方单位紧邻敌军即可集火。将敌方压缩至一个单位，赢得战役。</p>
    </section>
    <section className="deployment-panel">
      <div className="section-title"><h2>作战部署</h2><span>{THEMES[p.theme].name}</span></div>
      <div className="mode-choice">
        <button aria-pressed={p.gameMode==='pve'} onClick={()=>p.setGameMode('pve')}><b>人机演练</b><small>你指挥苍蓝先锋</small></button>
        <button aria-pressed={p.gameMode==='pvp'} onClick={()=>p.setGameMode('pvp')}><b>双人交锋</b><small>同屏轮流指挥</small></button>
      </div>
      {p.gameMode==='pve' && <div className="difficulty-choice" aria-label="AI 难度">
        {([['easy','新兵'],['medium','老兵'],['hard','精英']] as const).map(([id,label])=><button key={id} aria-pressed={p.difficulty===id} onClick={()=>p.setDifficulty(id)}>{label}</button>)}
      </div>}
      <button className="primary-button" onClick={p.onStart} disabled={!p.ready}>{p.ready ? '进入战场  →' : '正在装载作战资源…'}</button>
      <p className="deployment-note">{p.error || '掷骰决定先手 · 每回合推进一个单位'}</p>
      {p.error && <button className="quiet-button" onClick={p.onRetry}>重新加载资源</button>}
    </section>
  </div>
</main>;

export const RollingOverlay = ({diceResult}: {diceResult: DiceResult}) => <div className="rolling-overlay" role="status">
  <p className="eyebrow">决定行动顺序</p><div className="dice-pair">
    {(['red','blue'] as const).map(color=><div key={color} className={`dice-team ${color}`}><div className="dice-face">{diceResult[color] || '·'}</div><span>{FACTIONS[color].name}</span></div>)}
  </div><p>掷骰中…</p>
</div>;

interface ResultProps {
  winner: PlayerColor; mode: GameMode; turns: number; lost: boolean;
  onRestart: () => void; onHome: () => void; theme: ThemeKey;
}
export const GameOverOverlay = (p: ResultProps) => <main className={`result-page ${p.lost ? 'defeat' : 'victory'}`}>
  <div className="result-art" style={{backgroundImage:`url(${art(p.lost ? 'scene-defeat' : p.winner==='red' ? 'scene-victory-red' : 'scene-victory')})`}}/>
  <section className="result-content" role="status">
    <p className="eyebrow">{p.lost ? 'MISSION LOST / 战役结束' : 'MISSION COMPLETE / 战役完成'}</p>
    <h1>{p.lost ? '战线失守' : '战役胜利'}</h1>
    <p className="result-description">{p.lost ? '苍蓝先锋已撤出战场。重新部署，下一步仍由你决定。' : `${FACTIONS[p.winner].name}掌握了战场。每一次精准决策，都通向这一刻。`}</p>
    <div className="result-stats"><span><small>获胜军团</small><b>{FACTIONS[p.winner].name}</b></span><span><small>行动回合</small><b>{p.turns}</b></span><span><small>战区</small><b>{THEMES[p.theme].name}</b></span></div>
    {p.mode==='pvp' && <p className="deployment-note">{FACTIONS[p.winner==='red' ? 'blue' : 'red'].name}战败 · 双人战役结束</p>}
    <div className="result-actions"><button className="primary-button" onClick={p.onRestart}>再战一局 →</button><button className="quiet-button" onClick={p.onHome}>返回指挥部</button></div>
  </section>
</main>;
