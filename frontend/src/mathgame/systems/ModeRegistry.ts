import type { GameMode } from '../domain/types';

export const modeRegistry: GameMode[] = [
  {
    id: 'classic',
    title: 'Classic',
    description: '90 seconds of adaptive math flow.',
    initialDurationMs: 90_000,
    adaptiveSmoothing: 0.18
  },
  {
    id: 'sprint60',
    title: 'Sprint 60',
    description: 'Max score in 60 seconds.',
    initialDurationMs: 60_000,
    adaptiveSmoothing: 0.22
  },
  {
    id: 'twenty',
    title: '20 Tasks',
    description: 'Solve 20 tasks as fast and clean as possible.',
    targetTasks: 20,
    adaptiveSmoothing: 0.14
  },
  {
    id: 'streak',
    title: 'No-Miss Streak',
    description: 'Run ends after first mistake.',
    failEndsRun: true,
    adaptiveSmoothing: 0.16
  },
  {
    id: 'infinite',
    title: 'Infinite',
    description: 'Endless training for flow and mastery.',
    adaptiveSmoothing: 0.12
  },
  {
    id: 'equations',
    title: 'Equations',
    description: 'Solve linear equations in adaptive flow.',
    initialDurationMs: 90_000,
    adaptiveSmoothing: 0.17
  }
];

export const defaultModeId = 'classic';
