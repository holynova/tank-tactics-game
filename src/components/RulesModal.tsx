import { useEffect, useRef } from 'react';
import { art, unitImage } from '../constants/assets';
import { PlayerColor } from '../types/game';

const examples: {label:string;cells:(PlayerColor|null)[]}[]=[
  {label:'连续集火：赤铁 × 2 → 苍蓝',cells:[null,'red','red','blue']},
  {label:'反向集火：苍蓝 ← 赤铁 × 2',cells:['blue','red','red',null]},
  {label:'四单位满行：拥挤保护，不触发集火',cells:['red','blue','red','blue']},
  {label:'间隔空地：不触发集火',cells:['red',null,'red','blue']}
];
export default function RulesModal({onClose}:{onClose:()=>void}) {
  const dialog=useRef<HTMLDivElement>(null);
  const close=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement;
    close.current?.focus();
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape')onClose();
      if(event.key==='Tab'){
        const items=dialog.current?.querySelectorAll<HTMLButtonElement>('button');
        if(!items?.length)return;
        if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items[items.length-1].focus();}
        else if(!event.shiftKey&&document.activeElement===items[items.length-1]){event.preventDefault();items[0].focus();}
      }
    };
    document.addEventListener('keydown',key);
    return ()=>{document.removeEventListener('keydown',key);previous?.focus();};
  },[onClose]);
  return <div className="rules-backdrop" onClick={onClose}>
    <div className="rules-dialog" role="dialog" aria-modal="true" aria-labelledby="rules-title" ref={dialog} onClick={e=>e.stopPropagation()}>
      <div className="rules-banner" style={{backgroundImage:`linear-gradient(90deg,#12202bed,#12202ba8),url(${art('scene-lobby')})`,backgroundSize:'cover'}}>
        <div><p className="eyebrow">FIELD MANUAL / 作战手册</p><h2 id="rules-title">战术规则</h2></div>
        <button className="quiet-button" ref={close} onClick={onClose} aria-label="关闭规则">关闭 ×</button>
      </div>
      <div className="rules-body">
        <h3>01 / 战役目标</h3><p>消灭敌方部队，直到对方只剩一个单位或更少。双方轮流行动，掷骰决定先手。</p>
        <h3>02 / 单位移动</h3><p>每回合选择一个己方单位，移动到上下左右相邻的空格。单位先转向，再向目标位置推进。方向不影响集火判定。</p>
        <h3>03 / 集火与保护</h3><p>移动后，所在行或列出现连续的「己方、己方、敌方」或「敌方、己方、己方」时触发集火。中间不能有空格。两侧都有敌军、或同一行／列被四个单位填满时，保护机制会阻止集火。</p>
        <div className="rules-examples">{examples.map(example=><div key={example.label}><div className="rule-line">{example.cells.map((color,i)=><span key={i}>{color&&<img src={unitImage('tank',color)} alt={color==='red'?'赤铁单位':'苍蓝单位'}/>}</span>)}</div><small>{example.label}</small></div>)}</div>
        <h3>04 / 指挥模式</h3><p>人机演练：你控制蓝方「苍蓝先锋」，电脑控制红方「赤铁军团」。新兵、老兵、精英对应三档 AI 难度。双人交锋：双方由同屏玩家轮流控制。</p>
        <h3>05 / 战区与声音</h3><p>陆战和海战共享规则，单位造型、地形、运动表现和声音各有不同。可在行动结束后切换战区。声音设置可调整音量或立即静音。</p>
        <button className="primary-button rules-end" onClick={onClose}>了解，返回指挥 →</button>
      </div>
    </div>
  </div>;
}
