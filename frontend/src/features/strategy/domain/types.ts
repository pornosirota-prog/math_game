export type TerritoryOwner = 'player' | 'neutral';

export type TerritoryType = 'plains' | 'forest' | 'mountain';

export type BattleMode = 'standard';

export interface ResourcePool {
  gold: number;
  supplies: number;
}

export interface RewardProfile {
  gold: number;
  supplies: number;
}

export interface TerritoryEffect {
  id: string;
  label: string;
  applyProgressModifier?: (progressGain: number) => number;
}

export interface Territory {
  id: string;
  name: string;
  type: TerritoryType;
  owner: TerritoryOwner;
  defense: number;
  neighbors: string[];
  rewardProfile: RewardProfile;
  effects?: TerritoryEffect[];
}

export interface StrategyMap {
  territories: Territory[];
  playerStartTerritoryId: string;
}

export interface MathChallenge {
  id: string;
  prompt: string;
  answer: number;
}

export interface BattleDifficultyConfig {
  totalTimeMs: number;
  captureTarget: number;
  baseProgressPerCorrect: number;
  wrongAnswerPenalty: number;
  quickAnswerThresholdMs: number;
  mediumAnswerThresholdMs: number;
}

export interface DifficultyStrategy {
  getConfig(capturedTerritories: number): BattleDifficultyConfig;
}

export interface MathTaskGenerator {
  generateTask(capturedTerritories: number): MathChallenge;
}

export interface BattleAnswerInput {
  submittedAnswer: string;
  timeSpentMs: number;
}

export interface BattleSession {
  targetTerritoryId: string;
  mode: BattleMode;
  startedAt: number;
  endsAt: number;
  progress: number;
  streak: number;
  solved: number;
  correct: number;
  incorrect: number;
  bestStreak: number;
  currentTask: MathChallenge;
  isFinished: boolean;
  wasVictorious: boolean;
}

export interface BattleTickResult {
  session: BattleSession;
  isTimeout: boolean;
}

export interface BattleResolution {
  session: BattleSession;
  isCorrect: boolean;
  gainedProgress: number;
  speedMultiplier: number;
  comboMultiplier: number;
}

export interface RewardContext {
  territory: Territory;
  accuracy: number;
  solved: number;
  bestStreak: number;
}

export interface RewardCalculator {
  calculate(context: RewardContext): ResourcePool;
}

export interface BattleSummary {
  win: boolean;
  capturedTerritory: boolean;
  gainedResources: ResourcePool;
  accuracy: number;
  totalSolved: number;
  comboBest: number;
}

export interface StrategyActionLogEntry {
  id: string;
  timestamp: number;
  text: string;
}

export interface StrategyGameState {
  map: StrategyMap;
  resources: ResourcePool;
  selectedTerritoryId: string | null;
  activeBattle: BattleSession | null;
  lastSummary: BattleSummary | null;
  actionLog: StrategyActionLogEntry[];
}

export interface TileEffect {
  id: string;
  label: string;
}

export interface Unit {
  id: string;
  label: string;
}

export interface Building {
  id: string;
  label: string;
}

export interface Ability {
  id: string;
  label: string;
}
