import type { LeaderboardRecord, PlayerMetaProgress } from '../domain/types';
import { defaultProgress } from '../systems/ProgressionSystem';

const PROGRESS_KEY = 'mathflow.progress.v1';
const LEADERBOARD_KEY = 'mathflow.leaderboard.v1';

export const loadProgress = (): PlayerMetaProgress => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return defaultProgress;
  }
};

export const saveProgress = (progress: PlayerMetaProgress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

export const loadLeaderboard = (): LeaderboardRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export const addLeaderboardRecord = (record: LeaderboardRecord): LeaderboardRecord[] => {
  const next = [record, ...loadLeaderboard()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
  return next;
};
