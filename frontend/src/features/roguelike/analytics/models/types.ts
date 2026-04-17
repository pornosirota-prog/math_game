import { RunState } from '../../domain/types';

export type RunRoomType = 'fight' | 'elite' | 'chest' | 'shop' | 'rest' | 'event' | 'death';
export type MathType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';

export interface RunStep {
  step: number;
  roomType: RunRoomType;
  depth: number;
  hpAfterRoom: number;
  rewardOrEvent?: string;
  enemyName?: string;
}

export interface RunDeathInfo {
  reason: string;
  roomType: RunRoomType;
  depth: number;
  step: number;
}

export interface AccuracySample {
  depth: number;
  accuracy: number;
}

export interface ErrorHeatmapCell {
  mathType: MathType;
  depthBucket: string;
  errors: number;
}

export interface MathTypeStat {
  mathType: MathType;
  solved: number;
}

export interface RunSummaryStats {
  depthReached: number;
  enemiesDefeated: number;
  roomsCleared: number;
  gold: number;
  crystals: number;
  maxStreak: number;
  accuracy: number;
  durationMs: number;
  deathReason: string;
}

export interface RunAnalytics {
  steps: RunStep[];
  bestRunDepthProfile: Array<{ step: number; depth: number }>;
  deathInfo: RunDeathInfo | null;
  accuracyByDepth: AccuracySample[];
  errorHeatmap: ErrorHeatmapCell[];
  mathTypeBreakdown: MathTypeStat[];
  summary: RunSummaryStats;
  sourceState: Pick<RunState, 'status'>;
}
