import { BattleDifficultyConfig, ResourcePool } from '../domain/types';

export const STRATEGY_STORAGE_KEY = 'mathgame.strategy.v1';

export const STRATEGY_CONSTANTS = {
  LOG_LIMIT: 10,
  MAP_COLUMNS: 3,
  MAP_ROWS: 3
} as const;

export const STARTING_RESOURCES: ResourcePool = {
  gold: 100,
  supplies: 40
};

export const BASE_BATTLE_CONFIG: BattleDifficultyConfig = {
  totalTimeMs: 35_000,
  captureTarget: 100,
  baseProgressPerCorrect: 20,
  wrongAnswerPenalty: 12,
  quickAnswerThresholdMs: 3_000,
  mediumAnswerThresholdMs: 5_000
};
