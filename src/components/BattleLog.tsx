import { useEffect, useRef } from 'react';
import { ThemeKey, THEMES, FACTIONS } from '../constants/themes';
import { art, unitImage } from '../constants/assets';
interface Props {logs: string[]; theme: ThemeKey}
export default function BattleLog({logs, theme}: Props) {
  const area=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(area.current) area.current.scrollTop=area.current.scrollHeight;},[logs]);
  return <aside className="battle-sidebar">
    <section className="field-brief">
      <img className="brief-illustration" src={art('scene-lobby')} alt="装甲部队交锋的战场"/>
      <p className="eyebrow">战役目标 / OBJECTIVE</p><h2>压制敌军，<br/>掌控战场。</h2>
      <p>连续集火，消灭敌军至一个单位。友军保护与拥挤保护始终生效。</p>
    </section>
    <div className="sidebar-factions">{(['red','blue'] as const).map(color=><div key={color} className={color}><img src={unitImage(THEMES[theme].unitType,color)} alt=""/><span><b>{FACTIONS[color].name}</b><small>{FACTIONS[color][THEMES[theme].unitType]}</small></span></div>)}</div>
    <details className="battle-log" open><summary>战场记录 <span>{String(logs.length).padStart(2,'0')}</span></summary>
      <div className="log-entries" ref={area} aria-live="polite">
        {logs.map((log,i)=><p key={i} className={log.includes('赤铁') ? 'red' : log.includes('苍蓝') ? 'blue' : ''}><small>{String(i+1).padStart(2,'0')}</small>{log}</p>)}
      </div>
    </details>
  </aside>;
}
