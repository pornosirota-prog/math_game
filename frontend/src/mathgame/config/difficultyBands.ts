import type { DifficultyBand } from '../domain/types';

export const SKILL_FLOOR = 1;
export const SKILL_CEILING = 20;

export const difficultyBands: DifficultyBand[] = [
  {
    minSkill: 1,
    maxSkill: 3,
    numberRange: [1, 10],
    termCount: [2, 2],
    operations: ['+'],
    allowNegativeNumbers: false,
    allowParentheses: false,
    allowsUnknowns: false,
    taskKinds: ['arithmetic'],
    answerTimeLimitMs: 7000,
    challengeChance: 0.08
  },
  {
    minSkill: 4,
    maxSkill: 6,
    numberRange: [1, 20],
    termCount: [2, 3],
    operations: ['+', '-'],
    allowNegativeNumbers: false,
    allowParentheses: false,
    allowsUnknowns: false,
    taskKinds: ['arithmetic'],
    answerTimeLimitMs: 6200,
    challengeChance: 0.12
  },
  {
    minSkill: 7,
    maxSkill: 10,
    numberRange: [1, 30],
    termCount: [3, 4],
    operations: ['+', '-', '*'],
    allowNegativeNumbers: false,
    allowParentheses: false,
    allowsUnknowns: false,
    taskKinds: ['arithmetic'],
    answerTimeLimitMs: 5400,
    challengeChance: 0.16
  },
  {
    minSkill: 11,
    maxSkill: 15,
    numberRange: [1, 60],
    termCount: [3, 4],
    operations: ['+', '-', '*', '/'],
    allowNegativeNumbers: true,
    allowParentheses: true,
    allowsUnknowns: false,
    taskKinds: ['arithmetic'],
    answerTimeLimitMs: 4600,
    challengeChance: 0.2
  },
  {
    minSkill: 16,
    maxSkill: 20,
    numberRange: [-80, 120],
    termCount: [3, 5],
    operations: ['+', '-', '*', '/'],
    allowNegativeNumbers: true,
    allowParentheses: true,
    allowsUnknowns: true,
    taskKinds: ['arithmetic', 'equation'],
    answerTimeLimitMs: 3900,
    challengeChance: 0.25
  }
];
