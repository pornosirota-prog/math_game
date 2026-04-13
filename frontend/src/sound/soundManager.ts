import { sounds } from './soundConfig';

class SoundManager {
  play(key: keyof typeof sounds) {
    const audio = new Audio(sounds[key]);
    audio.volume = 0.35;
    audio.play().catch(() => undefined);
  }
}

export const soundManager = new SoundManager();
