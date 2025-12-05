// Sound Engine using Web Audio API
const soundEngine = {
  ctx: null,
  
  init: () => {
    if (!soundEngine.ctx) {
      soundEngine.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (soundEngine.ctx.state === 'suspended') {
      soundEngine.ctx.resume();
    }
  },
  
  playTone: (freq = 440, type = 'sine', duration = 0.1, vol = 0.1) => {
    if (!soundEngine.ctx) return;
    const osc = soundEngine.ctx.createOscillator();
    const gain = soundEngine.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, soundEngine.ctx.currentTime);
    gain.gain.setValueAtTime(vol, soundEngine.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, soundEngine.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(soundEngine.ctx.destination);
    osc.start();
    osc.stop(soundEngine.ctx.currentTime + duration);
  },
  
  playMotor: () => {
    if (!soundEngine.ctx) return;
    const t = soundEngine.ctx.currentTime;
    const duration = 0.8;

    // 1. Engine core low frequency (Engine Hum)
    const osc1 = soundEngine.ctx.createOscillator();
    const osc2 = soundEngine.ctx.createOscillator();
    const gainEngine = soundEngine.ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    
    osc1.frequency.setValueAtTime(45, t);
    osc1.frequency.linearRampToValueAtTime(60, t + 0.2);
    osc1.frequency.linearRampToValueAtTime(40, t + duration);

    osc2.frequency.setValueAtTime(48, t);
    osc2.frequency.linearRampToValueAtTime(63, t + 0.2);
    osc2.frequency.linearRampToValueAtTime(43, t + duration);

    gainEngine.gain.setValueAtTime(0.1, t);
    gainEngine.gain.linearRampToValueAtTime(0.15, t + 0.2);
    gainEngine.gain.exponentialRampToValueAtTime(0.01, t + duration);

    osc1.connect(gainEngine);
    osc2.connect(gainEngine);
    gainEngine.connect(soundEngine.ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(t + duration);
    osc2.stop(t + duration);

    // 2. Track Rumble (Filtered Noise)
    const bufferSize = soundEngine.ctx.sampleRate * duration;
    const buffer = soundEngine.ctx.createBuffer(1, bufferSize, soundEngine.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = soundEngine.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = soundEngine.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(120, t);
    noiseFilter.frequency.linearRampToValueAtTime(200, t + 0.3);
    noiseFilter.frequency.linearRampToValueAtTime(100, t + duration);

    const noiseGain = soundEngine.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, t);
    noiseGain.gain.linearRampToValueAtTime(0.2, t + 0.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(soundEngine.ctx.destination);
    
    noise.start();
  },
  
  playTurret: () => {
    if (!soundEngine.ctx) return;
    const osc = soundEngine.ctx.createOscillator();
    const gain = soundEngine.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, soundEngine.ctx.currentTime);
    gain.gain.setValueAtTime(0.03, soundEngine.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, soundEngine.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(soundEngine.ctx.destination);
    osc.start();
    osc.stop(soundEngine.ctx.currentTime + 0.2);
  },
  
  playFire: () => {
    if (!soundEngine.ctx) return;
    const t = soundEngine.ctx.currentTime;
    
    // Impact part
    const osc = soundEngine.ctx.createOscillator();
    const oscGain = soundEngine.ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    oscGain.gain.setValueAtTime(0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(oscGain);
    oscGain.connect(soundEngine.ctx.destination);
    osc.start();
    osc.stop(t + 0.3);

    // Noise part (simulating explosion airflow)
    const bufferSize = soundEngine.ctx.sampleRate * 0.5;
    const buffer = soundEngine.ctx.createBuffer(1, bufferSize, soundEngine.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = soundEngine.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = soundEngine.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    noise.connect(noiseGain);
    noiseGain.connect(soundEngine.ctx.destination);
    noise.start();
  },
  
  playExplosion: () => {
    if (!soundEngine.ctx) return;
    const t = soundEngine.ctx.currentTime;
    const bufferSize = soundEngine.ctx.sampleRate * 1.0;
    const buffer = soundEngine.ctx.createBuffer(1, bufferSize, soundEngine.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = soundEngine.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = soundEngine.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    const gain = soundEngine.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(soundEngine.ctx.destination);
    noise.start();
  }
};

export default soundEngine;
