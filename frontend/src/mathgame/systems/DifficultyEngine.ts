import { DIFFICULTY_MAX, DIFFICULTY_MIN, tierByDifficultyScore } from '../config/adaptiveTemplates';
import type { FlowState, TaskAttempt } from '../domain/types';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const scoreDeltaFromSpeed = (speedRatio: number): number => {
  if (speedRatio >= 1.25) return 4;
  if (speedRatio >= 1) return 3;
  if (speedRatio >= 0.75) return 2;
  return 1;
};

const streakBonus = (correctStreak: number): number => {
  if (correctStreak >= 8) return 3;
  if (correctStreak >= 5) return 2;
  if (correctStreak >= 3) return 1;
  return 0;
};

export class DifficultyEngine {
  constructor(private smoothing = 0.2) {}

  update(flow: FlowState, attempt: TaskAttempt): FlowState {
    const speedRatio = attempt.expectedTimeMs / Math.max(300, attempt.answerMs);
    const nextCorrectStreak = attempt.isCorrect ? flow.correctStreak + 1 : 0;
    const nextWrongStreak = attempt.isCorrect ? 0 : flow.wrongStreak + 1;

    let difficultyDelta = 0;
    if (attempt.isCorrect) {
      difficultyDelta += scoreDeltaFromSpeed(speedRatio);
      difficultyDelta += streakBonus(nextCorrectStreak);
    } else {
      difficultyDelta -= 4;
      if (nextWrongStreak >= 2) difficultyDelta -= 2;
      if (nextWrongStreak >= 3) difficultyDelta -= 2;
    }

    const nextDifficulty = clamp(flow.difficultyScore + difficultyDelta, DIFFICULTY_MIN, DIFFICULTY_MAX);
    const nextAccuracyRate = flow.accuracyRate * (1 - this.smoothing) + (attempt.isCorrect ? 1 : 0) * this.smoothing;
    const nextAvgAnswerMs = flow.avgAnswerTimeMs * (1 - this.smoothing) + attempt.answerMs * this.smoothing;

    const currentMastery = flow.templateMastery[attempt.templateId] ?? 0;
    const masteryDelta = attempt.isCorrect ? (speedRatio >= 1 ? 4 : 2) : -3;
    const nextMastery = clamp(currentMastery + masteryDelta, 0, 100);

    return {
      difficultyScore: nextDifficulty,
      currentTier: tierByDifficultyScore(nextDifficulty),
      avgAnswerTimeMs: nextAvgAnswerMs,
      accuracyRate: nextAccuracyRate,
      correctStreak: nextCorrectStreak,
      wrongStreak: nextWrongStreak,
      templateMastery: {
        ...flow.templateMastery,
        [attempt.templateId]: nextMastery
      }
    };
  }
}
