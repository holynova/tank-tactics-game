import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Header from './components/Header';
import BattleLog from './components/BattleLog';
import RulesModal from './components/RulesModal';
import StatusBar from './components/GameBoard/StatusBar';
import BattleBoard, { Motion } from './components/Battlefield/BattleBoard';
import { LobbyOverlay, RollingOverlay, GameOverOverlay } from './components/overlays/GameOverlays';
import { useSound } from './hooks/useSound';
import { findBestMove } from './hooks/useBotAI';
import { checkEatingCondition, buildGrid } from './rules/eatingRules';
import { getValidMoves, getRotationAngle } from './rules/movementRules';
import { checkWinCondition } from './rules/winCondition';
import { SIZE, ANIM_DURATION_ROTATE, ANIM_DURATION_MOVE, ANIM_DURATION_PROJECTILE } from './constants/gameConfig';
import { THEMES, ThemeKey, FACTIONS } from './constants/themes';
import { preloadArt } from './constants/assets';
import { Piece, PlayerColor, GamePhase, DiceResult, GameMode, Difficulty, Projectile, Explosion } from './types/game';
declare const APP_VERSION: string;

function initialPieces(): Piece[] {
  return (['red','blue'] as const).flatMap(color=>Array.from({length:SIZE},(_,c)=>({
    id: `${color==='red' ? 'r' : 'b'}-${c}`, color, r: color==='red' ? 0 : 3, c, angle: color==='red' ? 180 : 0
  })));
}
const face = (previous: number, target: number) => previous + ((target-previous+540)%360-180);
type Timer = {handle: ReturnType<typeof setTimeout>; resolve: () => void};

export default function App() {
  const [pieces,setPieces]=useState<Piece[]>(initialPieces);
  const [turn,setTurn]=useState<PlayerColor>('red');
  const [selected,setSelected]=useState<string|null>(null);
  const [phase,setPhase]=useState<GamePhase>('lobby');
  const [dice,setDice]=useState<DiceResult>({red:0,blue:0});
  const [busy,setBusy]=useState(false);
  const [motion,setMotion]=useState<Motion>(null);
  const [firing,setFiring]=useState<string[]>([]);
  const [logs,setLogs]=useState<string[]>(['等待作战部署']);
  const [winner,setWinner]=useState<PlayerColor|null>(null);
  const [projectiles,setProjectiles]=useState<Projectile[]>([]);
  const [explosions,setExplosions]=useState<Explosion[]>([]);
  const [lastMove,setLastMove]=useState<{r:number;c:number}|null>(null);
  const [theme,setTheme]=useState<ThemeKey>('land');
  const [showRules,setShowRules]=useState(false);
  const [mode,setMode]=useState<GameMode>('pve');
  const [difficulty,setDifficulty]=useState<Difficulty>('medium');
  const [enabled,setEnabled]=useState(true);
  const [volume,setVolume]=useState(0.55);
  const [ready,setReady]=useState(false);
  const [loadError,setLoadError]=useState('');
  const [turns,setTurns]=useState(0);
  const [action,setAction]=useState('');
  const epoch=useRef(0);
  const timerSet=useRef(new Set<Timer>());
  const busyRef=useRef(false);
  const loadingEpoch=useRef(0);
  const {playSound,unlock,stopSound}=useSound(enabled,volume,theme,phase==='playing');
  const grid=useMemo(()=>buildGrid(pieces),[pieces]);
  const log=useCallback((message:string)=>setLogs(old=>[...old.slice(-99),message]),[]);
  const delay=useCallback((ms:number)=>new Promise<void>(resolve=>{
    const timer:Timer={resolve,handle:setTimeout(()=>{timerSet.current.delete(timer);resolve();},ms)};
    timerSet.current.add(timer);
  }),[]);
  const cancel=useCallback(()=>{
    epoch.current++;
    for(const timer of timerSet.current){clearTimeout(timer.handle);timer.resolve();}
    timerSet.current.clear();
    busyRef.current=false;
  },[]);
  const loadResources=useCallback(async()=>{
    const id=++loadingEpoch.current;
    setReady(false);setLoadError('');
    try { await preloadArt(); if(id===loadingEpoch.current)setReady(true); }
    catch(e){ if(id===loadingEpoch.current)setLoadError(e instanceof Error ? e.message : '资源加载失败，请重试'); }
  },[]);
  const invalidateResources=useCallback(()=>{loadingEpoch.current++;},[]);
  useEffect(()=>{void loadResources();return ()=>{invalidateResources();cancel();};},[loadResources,cancel,invalidateResources]);
  useEffect(()=>{ if(phase!=='playing')window.scrollTo({top:0,behavior:'instant' as ScrollBehavior}); },[phase]);

  const reset=(nextPhase:GamePhase='lobby')=>{
    cancel();stopSound();setPieces(initialPieces());setTurn('red');setSelected(null);
    setWinner(null);setPhase(nextPhase);setDice({red:0,blue:0});setBusy(false);
    setMotion(null);setFiring([]);setProjectiles([]);setExplosions([]);
    setLastMove(null);setTurns(0);setAction('');setLogs(['双方部队已部署，准备决定先手']);
  };
  const start=async()=>{
    if(!ready || busyRef.current)return;
    reset('rolling');busyRef.current=true;setBusy(true);
    const id=epoch.current;void unlock();playSound('click');
    let result:DiceResult;
    do {
      for(let i=0;i<9;i++){
        if(epoch.current!==id)return;
        result={red:1+Math.floor(Math.random()*6),blue:1+Math.floor(Math.random()*6)};
        setDice(result);playSound('dice');await delay(90+i*8);
      }
      if(epoch.current!==id)return;
      result={red:1+Math.floor(Math.random()*6),blue:1+Math.floor(Math.random()*6)};
      setDice(result);await delay(450);
      if(epoch.current!==id)return;
      if(result.red===result.blue)log('点数相同，重新掷骰');
    } while(epoch.current===id && result.red===result.blue);
    if(epoch.current!==id)return;
    const first=result.red>result.blue ? 'red' : 'blue';
    setTurn(first);setPhase('playing');setBusy(false);busyRef.current=false;
    log(`${FACTIONS[first].name}获得先手`);playSound('turn');
  };
  const performTurn=useCallback(async(pieceId:string,toR:number,toC:number)=>{
    if(busyRef.current || phase!=='playing')return;
    const piece=pieces.find(p=>p.id===pieceId);
    if(!piece || piece.color!==turn || !getValidMoves(piece.r,piece.c,grid).some(m=>m.r===toR&&m.c===toC))return;
    busyRef.current=true;setBusy(true);setSelected(null);
    const id=epoch.current;
    const target=face(piece.angle,getRotationAngle(piece.r,piece.c,toR,toC));
    if(target!==piece.angle){
      setAction('转向');setMotion({id:pieceId,stage:'turning'});playSound('turret');
      setPieces(old=>old.map(p=>p.id===pieceId?{...p,angle:target}:p));
      await delay(ANIM_DURATION_ROTATE);
      if(epoch.current!==id)return;
    }
    setAction('推进');setMotion({id:pieceId,stage:'driving'});playSound('motor',piece.c/3*1.2-0.6);
    let next=pieces.map(p=>p.id===pieceId?{...p,r:toR,c:toC,angle:target}:p);
    setPieces(next);setLastMove({r:toR,c:toC});await delay(ANIM_DURATION_MOVE);
    if(epoch.current!==id)return;
    setMotion(null);setTurns(old=>old+1);
    log(`${FACTIONS[piece.color].name}推进至 ${'ABCD'[toR]}${toC+1}`);
    const eating=checkEatingCondition(buildGrid(next),toR,toC,piece.color);
    const victims=[...new Map(eating.eatenPieces.map(v=>[v.id,v])).values()];
    for(const victim of victims){
      const attackers=eating.attackers.filter(a=>a.r===victim.r || a.c===victim.c);
      setAction('瞄准');playSound('turret');
      next=next.map(p=>attackers.some(a=>a.id===p.id)?{...p,angle:face(p.angle,getRotationAngle(p.r,p.c,victim.r,victim.c))}:p);
      setPieces(next);await delay(ANIM_DURATION_ROTATE);
      if(epoch.current!==id)return;
      setAction('集火');setFiring(attackers.map(a=>a.id));
      playSound('fire',victim.c/3*1.2-0.6);
      setProjectiles(attackers.map((a,i)=>({id:Date.now()+i,from:{r:a.r,c:a.c},to:{r:victim.r,c:victim.c}})));
      await delay(ANIM_DURATION_PROJECTILE);
      if(epoch.current!==id)return;
      setFiring([]);setProjectiles([]);playSound('explode',victim.c/3*1.2-0.6);
      setExplosions([{id:Date.now(),r:victim.r,c:victim.c}]);
      next=next.filter(p=>p.id!==victim.id);setPieces(next);
      log(`${FACTIONS[piece.color].name}集火摧毁敌军单位`);
      await delay(780);
      if(epoch.current!==id)return;
      setExplosions([]);
    }
    const outcome=checkWinCondition(next);
    if(outcome.hasWinner && outcome.winner){
      setWinner(outcome.winner);setPhase('gameover');
      log(`${FACTIONS[outcome.winner].name}赢得战役`);
      playSound(mode==='pve'&&outcome.winner==='red'?'lose':'win');
    } else { setTurn(piece.color==='red'?'blue':'red');playSound('turn'); }
    setBusy(false);busyRef.current=false;setAction('');
  },[phase,pieces,turn,grid,delay,playSound,log,mode]);
  const cell=(r:number,c:number)=>{
    if(phase!=='playing'||busyRef.current||(mode==='pve'&&turn==='red'))return;
    const unit=grid[r][c];
    if(unit?.color===turn){setSelected(old=>old===unit.id?null:unit.id);playSound('click');}
    else if(selected && !unit)void performTurn(selected,r,c);
  };
  useEffect(()=>{
    if(phase!=='playing'||mode!=='pve'||turn!=='red'||busy||showRules)return;
    const timer=setTimeout(()=>{
      const depth={easy:1,medium:2,hard:3}[difficulty];
      const move=findBestMove(pieces,grid,depth,'red');
      if(move)void performTurn(move.pieceId,move.to.r,move.to.c);
      else {log('赤铁军团无可用移动，跳过回合');setTurn('blue');}
    },650);
    return ()=>clearTimeout(timer);
  },[phase,mode,turn,busy,pieces,grid,difficulty,performTurn,log,showRules]);
  return <div className={`game-shell theme-${theme}`}>
    <Header theme={theme} enabled={enabled} volume={volume} busy={busy} home={phase==='lobby'}
      onTheme={t=>{if(!busy){setTheme(t);playSound('click');}}}
      onSound={()=>{void unlock();setEnabled(v=>!v);}} onVolume={setVolume}
      onRules={()=>setShowRules(true)} onHome={()=>reset()} onReset={()=>reset()}/>
    {phase==='lobby' ? <LobbyOverlay gameMode={mode} setGameMode={setMode} difficulty={difficulty}
      setDifficulty={setDifficulty} theme={theme} onStart={()=>void start()} ready={ready} error={loadError} onRetry={()=>void loadResources()}/>
      : phase==='gameover'&&winner ? <GameOverOverlay winner={winner} mode={mode} turns={turns} lost={mode==='pve'&&winner==='red'}
        onRestart={()=>void start()} onHome={()=>reset()} theme={theme}/>
      : <main className="battle-page">
        <section className="battle-main">
          <div className="battle-heading"><div><p className="eyebrow">{THEMES[theme].codename} / ACTIVE OPERATION</p><h1>{THEMES[theme].name}</h1></div><span className="live-tag">战役进行中</span></div>
          <StatusBar turn={turn} isAnimating={busy} gameMode={mode} pieces={pieces} action={action} turns={turns}/>
          <div className="board-wrap">
            <BattleBoard pieces={pieces} grid={grid} theme={theme} selected={selected} turn={turn} busy={busy} motion={motion}
              firing={firing} projectiles={projectiles} explosions={explosions} lastMove={lastMove}
              interactive={phase==='playing'&&(mode==='pvp'||turn==='blue')} onCell={cell}/>
            {phase==='rolling'&&<RollingOverlay diceResult={dice}/>}
          </div>
          <p className="combat-hint">{phase==='rolling'?'掷骰决定先手':busy?`${FACTIONS[turn].name}正在${action}`:
            mode==='pve'&&turn==='red'?'赤铁军团正在制定战术…':selected?'选择标记的空格，向相邻位置推进':'选择己方单位，规划下一步行动'} <span>支持点击与键盘 Tab / Enter</span></p>
        </section>
        <BattleLog logs={logs} theme={theme}/>
      </main>}
    <footer className="game-footer"><span>TACTICS OVER FORCE. · {APP_VERSION}</span><span>双军团 · 双战场 · 十六格博弈</span><a href="https://github.com/holynova/tank-tactics-game" target="_blank" rel="noreferrer">GitHub ↗</a></footer>
    {showRules&&<RulesModal onClose={()=>setShowRules(false)}/>}
  </div>;
}
