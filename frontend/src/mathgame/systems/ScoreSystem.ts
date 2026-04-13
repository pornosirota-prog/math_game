import type { FlowState, TaskAttempt } from '../domain/types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class ScoreSystem {
  scoreAttempt(flow: FlowState, attempt: TaskAttempt, combo: number): { scoreDelta: number; nextCombo: number; speedMultiplier: number } {
    if (!attempt.isCorrect) {
      return { scoreDelta: -8, nextCombo: 0, speedMultiplier: 1 };
    }

    const timeFactor = clamp(1.7 - attempt.answerMs / 5000, 0.55, 1.7);
    const comboFactor = 1 + Math.min(1.4, combo * 0.06);
    const difficultyFactor = 1 + attempt.difficultyRating / 25;
    const speedMultiplier = Number((timeFactor + flow.flow / 220).toFixed(2));

    const raw = 20 * timeFactor * comboFactor * difficultyFactor;
    return {
      scoreDelta: Math.round(raw),
      nextCombo: combo + 1,
      speedMultiplier
    };
  }
}
