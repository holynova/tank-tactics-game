import { useCallback } from 'react';
import soundEngine from '../utils/soundEngine';

/**
 * Custom hook for managing game sounds
 * @param {boolean} enabled - Whether sound is enabled
 * @returns {Object} Sound control functions
 */
export const useSound = (enabled) => {
  const playSound = useCallback((type) => {
    if (!enabled) return;
    soundEngine.init();
    
    switch (type) {
      case 'click':
        soundEngine.playTone(600, 'sine', 0.05, 0.05);
        break;
      case 'motor':
        soundEngine.playMotor();
        break;
      case 'turret':
        soundEngine.playTurret();
        break;
      case 'fire':
        soundEngine.playFire();
        break;
      case 'explode':
        soundEngine.playExplosion();
        break;
      case 'dice':
        soundEngine.playTone(800 + Math.random() * 200, 'triangle', 0.05, 0.05);
        break;
      default:
        break;
    }
  }, [enabled]);

  const initSoundContext = useCallback(() => {
    soundEngine.init();
  }, []);

  return { playSound, initSoundContext };
};

export default useSound;
