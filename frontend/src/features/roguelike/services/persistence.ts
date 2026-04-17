import { RunSummary } from '../domain/types';

export const ROGUELIKE_STORAGE_KEY = 'mathgame.roguelike.best.v1';

export interface RoguelikePersisted {
  bestDepth: number;
  lastSummary: RunSummary | null;
}

export const loadRoguelikeStats = (): RoguelikePersisted => {
  try {
    const raw = localStorage.getItem(ROGUELIKE_STORAGE_KEY);
    if (!raw) return { bestDepth: 0, lastSummary: null };
    const parsed = JSON.parse(raw) as Partial<RoguelikePersisted>;
    return {
      bestDepth: parsed.bestDepth ?? 0,
      lastSummary: parsed.lastSummary ?? null
    };
  } catch {
    return { bestDepth: 0, lastSummary: null };
  }
};

export const saveRoguelikeStats = (stats: RoguelikePersisted) => {
  localStorage.setItem(ROGUELIKE_STORAGE_KEY, JSON.stringify(stats));
};
