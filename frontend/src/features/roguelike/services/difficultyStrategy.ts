import { DifficultyBand, DifficultyStrategy } from '../domain/types';

export class MathDifficultyScaler implements DifficultyStrategy {
  getBand(depth: number): DifficultyBand {
    if (depth <= 3) {
      return { depth, operations: ['+', '-'], min: 1, max: 12, chained: false };
    }
    if (depth <= 8) {
      return { depth, operations: ['+', '-', '*'], min: 3, max: 16, chained: false };
    }
    if (depth <= 15) {
      return { depth, operations: ['+', '-', '*', '/'], min: 4, max: 24, chained: true };
    }
    return {
      depth,
      operations: ['+', '-', '*', '/'],
      min: Math.min(35, 8 + Math.floor(depth * 0.8)),
      max: Math.min(120, 24 + depth * 2),
      chained: true
    };
  }
}
