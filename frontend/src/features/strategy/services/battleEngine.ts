import { BASE_BATTLE_CONFIG } from '../config/strategyConfig';
import {
  BattleAnswerInput,
  BattleDifficultyConfig,
  BattleResolution,
  BattleSession,
  DifficultyStrategy,
  MathTaskGenerator
} from '../domain/types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export class LinearDifficultyStrategy implements DifficultyStrategy {
  getConfig(capturedTerritories: number): BattleDifficultyConfig {
    const growth = Math.max(0, capturedTerritories - 1);

    return {
      ...BASE_BATTLE_CONFIG,
      totalTimeMs: Math.max(20_000, BASE_BATTLE_CONFIG.totalTimeMs - growth * 1_000),
      baseProgressPerCorrect: Math.max(12, BASE_BATTLE_CONFIG.baseProgressPerCorrect - growth),
      wrongAnswerPenalty: BASE_BATTLE_CONFIG.wrongAnswerPenalty + Math.floor(growth * 0.6)
    };
  }
}

const getSpeedMultiplier = (timeSpentMs: number, config: BattleDifficultyConfig) => {
  if (timeSpentMs <= config.quickAnswerThresholdMs) return 1.35;
  if (timeSpentMs <= config.mediumAnswerThresholdMs) return 1.15;
  return 1;
};

const parseAnswer = (value: string) => Number(value.trim().replace(',', '.'));

export class BattleEngine {
  constructor(
    private readonly generator: MathTaskGenerator,
    private readonly difficulty: DifficultyStrategy
  ) {}

  createSession(targetTerritoryId: string, capturedTerritories: number, now = Date.now()): BattleSession {
    const config = this.difficulty.getConfig(capturedTerritories);
    return {
      targetTerritoryId,
      mode: 'standard',
      startedAt: now,
      endsAt: now + config.totalTimeMs,
      progress: 0,
      streak: 0,
      solved: 0,
      correct: 0,
      incorrect: 0,
      bestStreak: 0,
      currentTask: this.generator.generateTask(capturedTerritories),
      isFinished: false,
      wasVictorious: false
    };
  }

  applyAnswer(
    session: BattleSession,
    capturedTerritories: number,
    input: BattleAnswerInput
  ): BattleResolution {
    const config = this.difficulty.getConfig(capturedTerritories);
    const submitted = parseAnswer(input.submittedAnswer);
    const isCorrect = Number.isFinite(submitted) && Math.abs(submitted - session.currentTask.answer) < 0.01;

    if (!isCorrect) {
      const nextSession: BattleSession = {
        ...session,
        solved: session.solved + 1,
        incorrect: session.incorrect + 1,
        streak: 0,
        progress: clamp(session.progress - config.wrongAnswerPenalty, 0, config.captureTarget),
        currentTask: this.generator.generateTask(capturedTerritories)
      };
      return {
        session: nextSession,
        isCorrect: false,
        gainedProgress: -config.wrongAnswerPenalty,
        speedMultiplier: 1,
        comboMultiplier: 1
      };
    }

    const speedMultiplier = getSpeedMultiplier(input.timeSpentMs, config);
    const comboMultiplier = 1 + Math.min(0.4, session.streak * 0.05);
    const gainedProgress = Math.round(config.baseProgressPerCorrect * speedMultiplier * comboMultiplier);
    const nextProgress = clamp(session.progress + gainedProgress, 0, config.captureTarget);
    const nextStreak = session.streak + 1;

    const nextSession: BattleSession = {
      ...session,
      solved: session.solved + 1,
      correct: session.correct + 1,
      streak: nextStreak,
      bestStreak: Math.max(session.bestStreak, nextStreak),
      progress: nextProgress,
      isFinished: nextProgress >= config.captureTarget,
      wasVictorious: nextProgress >= config.captureTarget,
      currentTask: this.generator.generateTask(capturedTerritories)
    };

    return {
      session: nextSession,
      isCorrect: true,
      gainedProgress,
      speedMultiplier,
      comboMultiplier
    };
  }

  markTimeout(session: BattleSession): BattleSession {
    if (session.isFinished) return session;
    return {
      ...session,
      isFinished: true,
      wasVictorious: false
    };
  }
}
