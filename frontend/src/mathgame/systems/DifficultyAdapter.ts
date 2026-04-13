import { SKILL_CEILING, SKILL_FLOOR } from '../config/difficultyBands';
import type { FlowState, TaskAttempt } from '../domain/types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class DifficultyAdapter {
  constructor(private smoothing = 0.18) {}

  update(flow: FlowState, attempt: TaskAttempt): FlowState {
    const nextAnswered = flow.accuracy === 0 ? 1 : undefined;
    const weightedAccuracy = attempt.isCorrect ? 1 : 0;
    const accuracy = nextAnswered
      ? weightedAccuracy
      : flow.accuracy * (1 - this.smoothing) + weightedAccuracy * this.smoothing;

    const avgAnswerMs = flow.avgAnswerMs * (1 - this.smoothing) + attempt.answerMs * this.smoothing;
    const speedScore = clamp((3500 - avgAnswerMs) / 2500, -1, 1);
    const streakBoost = attempt.isCorrect ? Math.min(0.35, (flow.correctStreak + 1) * 0.03) : -Math.min(0.45, (flow.errorStreak + 1) * 0.08);
    const precisionBoost = (accuracy - 0.75) * 0.6;

    const deltaSkill = speedScore * 0.35 + precisionBoost + streakBoost;
    const skill = clamp(flow.skill + deltaSkill, SKILL_FLOOR, SKILL_CEILING);

    const flowMeter = clamp(flow.flow + deltaSkill * 7, 0, 100);

    return {
      skill,
      flow: flowMeter,
      avgAnswerMs,
      accuracy,
      correctStreak: attempt.isCorrect ? flow.correctStreak + 1 : 0,
      errorStreak: attempt.isCorrect ? 0 : flow.errorStreak + 1
    };
  }
}
