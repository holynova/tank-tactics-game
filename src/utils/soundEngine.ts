import { ThemeKey } from '../constants/themes';
export type SoundType = 'click' | 'motor' | 'turret' | 'fire' | 'explode' | 'dice' | 'turn' | 'win' | 'lose';
export const AUDIO_FILES = ['click','dice','turn','win','lose',
  ...(['land','sea'] as const).flatMap(t=>['motor','turret','fire','explode','ambient'].map(name=>`${name}-${t}`))];

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<string, Promise<AudioBuffer>>();
  private voices = new Set<AudioBufferSourceNode>();
  private ambient: AudioBufferSourceNode | null = null;
  private ambientKey = '';
  private ambientRequest = 0;
  private generation = 0;
  private enabled = true;
  private volume = .55;
  private desiredAmbient: ThemeKey | null = null;

  init() {
    if(!this.ctx) {
      const Constructor = window.AudioContext || (window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
      if(!Constructor)return;
      this.ctx = new Constructor();
      this.master = this.ctx.createGain();
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -12; compressor.knee.value = 12;
      compressor.ratio.value = 6; compressor.attack.value = .003; compressor.release.value = .18;
      this.master.connect(compressor); compressor.connect(this.ctx.destination);
      this.master.gain.value = this.enabled ? this.volume : 0;
    }
    if(this.ctx.state==='suspended')void this.ctx.resume().catch(()=>{});
  }
  async unlock() {
    this.init();
    if(!this.ctx)return;
    await Promise.allSettled(AUDIO_FILES.map(name=>this.buffer(name)));
    if(this.desiredAmbient)void this.setAmbient(this.desiredAmbient);
  }
  private async buffer(name: string): Promise<AudioBuffer> {
    if(!this.ctx)throw new Error('Audio context is not initialized');
    let pending = this.buffers.get(name);
    if(!pending) {
      const ctx=this.ctx;
      pending=(async()=>{
        let last:unknown;
        for(const ext of ['ogg','wav']) {
          try {
            const response=await fetch(`${import.meta.env.BASE_URL}audio/${name}.${ext}`);
            if(!response.ok)throw new Error(`HTTP ${response.status}`);
            return await ctx.decodeAudioData(await response.arrayBuffer());
          } catch(error){last=error;}
        }
        this.buffers.delete(name); throw last;
      })();
      this.buffers.set(name,pending);
    }
    return pending;
  }
  configure(enabled: boolean, volume: number) {
    this.enabled=enabled;this.volume=volume;
    if(this.ctx&&this.master) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(enabled&&!document.hidden?volume:0,this.ctx.currentTime,.015);
    }
    if(!enabled)this.stopAll();
    else if(this.desiredAmbient)void this.setAmbient(this.desiredAmbient);
  }
  async play(type: SoundType, theme: ThemeKey, pan=0) {
    if(!this.enabled||document.hidden)return;
    this.init();
    if(!this.ctx||!this.master)return;
    const generation=this.generation;
    const name=['motor','turret','fire','explode'].includes(type)?`${type}-${theme}`:type;
    try {
      const buffer=await this.buffer(name);
      if(generation!==this.generation||!this.enabled||document.hidden||!this.ctx||!this.master)return;
      if(this.voices.size>=8) {
        const oldest=this.voices.values().next().value;
        if(oldest){oldest.stop();this.voices.delete(oldest);}
      }
      const source=this.ctx.createBufferSource();
      const gain=this.ctx.createGain();
      const panner=this.ctx.createStereoPanner();
      source.buffer=buffer;
      source.playbackRate.value=['motor','turret','fire','explode','dice'].includes(type)?.98+Math.random()*.04:1;
      gain.gain.value=type==='dice'?.55:1;
      panner.pan.value=Math.max(-.6,Math.min(.6,pan));
      source.connect(gain);gain.connect(panner);panner.connect(this.master);
      this.voices.add(source);
      source.onended=()=>{source.disconnect();gain.disconnect();panner.disconnect();this.voices.delete(source);};
      source.start();
    } catch(error){console.warn(`Sound asset unavailable: ${name}`,error);}
  }
  async setAmbient(theme: ThemeKey | null) {
    this.desiredAmbient=theme;
    const key=theme?`ambient-${theme}`:'';
    if(key===this.ambientKey&&this.ambient)return;
    const request=++this.ambientRequest;
    this.stopAmbient();
    if(!theme||!this.enabled||document.hidden||!this.ctx||!this.master)return;
    try {
      const buffer=await this.buffer(key);
      if(request!==this.ambientRequest||!this.enabled||document.hidden||!this.ctx||!this.master)return;
      const source=this.ctx.createBufferSource();
      const gain=this.ctx.createGain();
      source.buffer=buffer;source.loop=true;
      gain.gain.setValueAtTime(0,this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(.65,this.ctx.currentTime+.3);
      source.connect(gain);gain.connect(this.master);
      source.onended=()=>{source.disconnect();gain.disconnect();};
      source.start();this.ambient=source;this.ambientKey=key;
    }catch(error){console.warn('Ambient asset unavailable',error);}
  }
  private stopAmbient() {
    if(this.ambient){this.ambient.stop();this.ambient=null;}this.ambientKey='';
  }
  stopAll() {
    this.generation++;this.ambientRequest++;this.stopAmbient();
    for(const voice of this.voices)voice.stop();
    this.voices.clear();
  }
}
export default new SoundEngine();
