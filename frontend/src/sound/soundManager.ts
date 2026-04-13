import { sounds } from './soundConfig';
import { useSettingsStore } from '../store/settingsStore';

const musicKeys: Array<keyof typeof sounds> = ['reward', 'levelUp'];

class SoundManager {
  play(key: keyof typeof sounds) {
    const { soundEnabled, musicEnabled } = useSettingsStore.getState();
    if (!soundEnabled) return;
    if (musicKeys.includes(key) && !musicEnabled) return;

    const audio = new Audio(sounds[key]);
    audio.volume = 0.35;
    audio.play().catch(() => undefined);
  }
}

export const soundManager = new SoundManager();
