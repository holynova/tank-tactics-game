import { ThemeKey, THEMES } from '../constants/themes';
interface Props {
  theme: ThemeKey; enabled: boolean; volume: number; busy: boolean; home: boolean;
  onTheme: (theme: ThemeKey) => void; onSound: () => void; onVolume: (v: number) => void;
  onRules: () => void; onHome: () => void; onReset: () => void;
}
export default function Header(p: Props) {
  return <header className="command-header">
    <button className="brand" onClick={p.onHome} aria-label="返回指挥部">
      <span className="brand-mark">T<span>4</span></span>
      <span><b>坦克战术</b><small>TANK TACTICS / FIELD COMMAND</small></span>
    </button>
    <nav className="theme-switch" aria-label="战场主题">
      {(['land','sea'] as const).map(t=><button key={t} disabled={p.busy} aria-pressed={p.theme===t} onClick={()=>p.onTheme(t)}>{THEMES[t].name}</button>)}
    </nav>
    <div className="header-tools">
      <details className="audio-settings">
        <summary aria-label="声音设置">声音 {p.enabled ? '开' : '关'}</summary>
        <div className="audio-panel">
          <button className="quiet-button" onClick={p.onSound}>{p.enabled ? '关闭声音' : '开启声音'}</button>
          <label>主音量 <span>{Math.round(p.volume*100)}%</span>
            <input aria-label="主音量" type="range" min="0" max="100" value={Math.round(p.volume*100)} onChange={e=>p.onVolume(Number(e.target.value)/100)}/>
          </label>
          <small>环境 · 引擎 · 战斗音效</small>
        </div>
      </details>
      <button className="quiet-button" onClick={p.onRules}>规则</button>
      {!p.home && <button className="quiet-button" onClick={p.onReset} aria-label="重新部署"><span className="desktop-word">重新部署</span><span className="mobile-word">重开</span></button>}
    </div>
  </header>;
}
