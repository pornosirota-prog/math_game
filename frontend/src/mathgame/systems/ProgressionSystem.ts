import type { GameModeId, PlayerMetaProgress, TaskKind } from '../domain/types';

const XP_PER_LEVEL = 120;

export const defaultProgress: PlayerMetaProgress = {
  level: 1,
  xp: 0,
  totalRuns: 0,
  bestScore: 0,
  unlockedModes: ['classic', 'sprint60', 'allmix', 'custom', 'equations'],
  unlockedTaskKinds: ['arithmetic'],
  achievements: [],
  dailyChallengeStreak: 0
};

const unlockModesByLevel = (level: number): GameModeId[] => {
  const base: GameModeId[] = ['classic', 'sprint60', 'allmix', 'custom', 'equations'];
  if (level >= 3) base.push('twenty');
  if (level >= 5) base.push('streak');
  if (level >= 7) base.push('infinite');
  return base;
};

const unlockKindsByLevel = (level: number): TaskKind[] => {
  const kinds: TaskKind[] = ['arithmetic'];
  if (level >= 16) kinds.push('equation');
  return kinds;
};

export class ProgressionSystem {
  applyRun(progress: PlayerMetaProgress, score: number, accuracy: number): PlayerMetaProgress {
    const earnedXp = Math.max(40, Math.round(score * 0.09 + accuracy * 60));
    const totalXp = progress.xp + earnedXp;
    const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;

    const achievements = new Set(progress.achievements);
    if (score >= 500) achievements.add('score_500');
    if (accuracy >= 0.95) achievements.add('sharp_mind');
    if (level >= 10) achievements.add('veteran');

    return {
      ...progress,
      xp: totalXp,
      level,
      totalRuns: progress.totalRuns + 1,
      bestScore: Math.max(progress.bestScore, score),
      unlockedModes: unlockModesByLevel(level),
      unlockedTaskKinds: unlockKindsByLevel(level),
      achievements: Array.from(achievements)
    };
  }
}
