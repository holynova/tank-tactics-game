import { useCallback, useEffect } from 'react';
import soundEngine, { SoundType } from '../utils/soundEngine';
import { ThemeKey } from '../constants/themes';
export const useSound=(enabled:boolean,volume:number,theme:ThemeKey,active:boolean)=>{
  useEffect(()=>{soundEngine.configure(enabled,volume);},[enabled,volume]);
  useEffect(()=>{void soundEngine.setAmbient(active?theme:null);},[active,theme,enabled]);
  useEffect(()=>{
    const visibility=()=>{if(document.hidden)soundEngine.stopAll();soundEngine.configure(enabled,volume);};
    document.addEventListener('visibilitychange',visibility);
    return ()=>document.removeEventListener('visibilitychange',visibility);
  },[enabled,volume]);
  useEffect(()=>()=>soundEngine.stopAll(),[]);
  const playSound=useCallback((type:SoundType,pan=0)=>{if(enabled)void soundEngine.play(type,theme,pan);},[enabled,theme]);
  const unlock=useCallback(()=>soundEngine.unlock(),[]);
  const stopSound=useCallback(()=>soundEngine.stopAll(),[]);
  return {playSound,unlock,stopSound};
};
export default useSound;
