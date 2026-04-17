import { RunState } from '../../domain/types';
import { detectMathCategory } from '../../store/runEngine';
import { ErrorHeatmapCell, MathType, RunAnalytics, RunRoomType } from '../models/types';

const toRunRoomType = (roomType: string): RunRoomType => {
  if (roomType === 'treasure') return 'chest';
  if (roomType === 'fight' || roomType === 'elite' || roomType === 'shop' || roomType === 'rest' || roomType === 'event') return roomType;
  return 'event';
};

const DEPTH_BUCKET_SIZE = 5;

const makeDepthBucket = (depth: number) => {
  const start = Math.floor((depth - 1) / DEPTH_BUCKET_SIZE) * DEPTH_BUCKET_SIZE + 1;
  const end = start + DEPTH_BUCKET_SIZE - 1;
  return `${start}-${end}`;
};

export const mapRunStateToAnalytics = (state: RunState, recordDepth: number): RunAnalytics => {
  const steps = state.runSteps.map((step) => ({
    step: step.step,
    roomType: toRunRoomType(step.roomType),
    depth: step.depth,
    hpAfterRoom: step.hpAfterRoom,
    rewardOrEvent: step.rewardOrEvent,
    enemyName: step.enemyName
  }));

  if (state.death) {
    steps.push({
      step: state.death.step + 1,
      roomType: 'death',
      depth: state.death.depth,
      hpAfterRoom: 0,
      rewardOrEvent: state.death.reason,
      enemyName: undefined
    });
  }

  const groupedAccuracy = new Map<number, { total: number; correct: number }>();
  const heatCellMap = new Map<string, ErrorHeatmapCell>();
  const mathTypeSolved = new Map<MathType, number>([
    ['addition', 0],
    ['subtraction', 0],
    ['multiplication', 0],
    ['division', 0],
    ['mixed', 0]
  ]);

  state.answerHistory.forEach((entry) => {
    const acc = groupedAccuracy.get(entry.depth) ?? { total: 0, correct: 0 };
    acc.total += 1;
    if (entry.isCorrect) acc.correct += 1;
    groupedAccuracy.set(entry.depth, acc);

    const mathType = detectMathCategory(entry.prompt);
    mathTypeSolved.set(mathType, (mathTypeSolved.get(mathType) ?? 0) + 1);

    if (!entry.isCorrect || entry.timedOut) {
      const depthBucket = makeDepthBucket(entry.depth);
      const id = `${mathType}:${depthBucket}`;
      const existing = heatCellMap.get(id) ?? { mathType, depthBucket, errors: 0 };
      existing.errors += 1;
      heatCellMap.set(id, existing);
    }
  });

  const accuracyByDepth = [...groupedAccuracy.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([depth, sample]) => ({ depth, accuracy: sample.total ? sample.correct / sample.total : 0 }));

  const mathTypeBreakdown = [...mathTypeSolved.entries()].map(([mathType, solved]) => ({ mathType, solved }));

  const durationMs = (state.runEndedAt ?? Date.now()) - state.runStartedAt;

  return {
    steps,
    bestRunDepthProfile: Array.from({ length: Math.max(0, recordDepth) }, (_, index) => ({ step: index + 1, depth: index + 1 })),
    deathInfo: state.death ? {
      reason: state.death.reason,
      roomType: toRunRoomType(state.death.roomType),
      depth: state.death.depth,
      step: state.death.step
    } : null,
    accuracyByDepth,
    errorHeatmap: [...heatCellMap.values()],
    mathTypeBreakdown,
    summary: {
      depthReached: state.depth,
      enemiesDefeated: state.enemiesDefeated,
      roomsCleared: state.roomsCleared,
      gold: state.player.gold,
      crystals: state.player.crystals,
      maxStreak: state.player.bestCombo,
      accuracy: state.player.solved ? state.player.correct / state.player.solved : 0,
      durationMs,
      deathReason: state.death?.reason ?? 'Забег активен'
    },
    sourceState: { status: state.status }
  };
};
