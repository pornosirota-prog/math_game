import type { DifficultyTemplate, TemplateId, TemplateMasteryMap } from '../domain/types';

export const DIFFICULTY_MIN = 0;
export const DIFFICULTY_MAX = 100;

export const templates: DifficultyTemplate[] = [
  {
    id: 'tier1_two_single_add',
    tier: 1,
    label: '2 однозначных: сложение',
    taskKind: 'arithmetic',
    operations: ['+'],
    numberSpecs: [{ min: 1, max: 9 }, { min: 1, max: 9 }],
    expectedTimeMs: 2000,
    allowNegativeResult: false
  },
  {
    id: 'tier2_single_plus_double',
    tier: 2,
    label: '1 однозначное + 1 двузначное',
    taskKind: 'arithmetic',
    operations: ['+'],
    numberSpecs: [{ min: 1, max: 9 }, { min: 10, max: 99 }],
    expectedTimeMs: 2500,
    allowNegativeResult: false
  },
  {
    id: 'tier3_two_double_no_carry',
    tier: 3,
    label: '2 двузначных без перехода через десяток',
    taskKind: 'arithmetic',
    operations: ['+'],
    numberSpecs: [{ min: 10, max: 99 }, { min: 10, max: 99 }],
    expectedTimeMs: 3000,
    allowNegativeResult: false,
    requiresCarry: false
  },
  {
    id: 'tier4_two_double_with_carry',
    tier: 4,
    label: '2 двузначных с переходом через десяток',
    taskKind: 'arithmetic',
    operations: ['+'],
    numberSpecs: [{ min: 10, max: 99 }, { min: 10, max: 99 }],
    expectedTimeMs: 3200,
    allowNegativeResult: false,
    requiresCarry: true
  },
  {
    id: 'tier5_two_triple_light',
    tier: 5,
    label: '2 трехзначных без сильного переноса',
    taskKind: 'arithmetic',
    operations: ['+'],
    numberSpecs: [{ min: 100, max: 499 }, { min: 100, max: 499 }],
    expectedTimeMs: 3800,
    allowNegativeResult: false,
    requiresCarry: false
  },
  {
    id: 'tier6_two_triple_carry',
    tier: 6,
    label: '2 трехзначных с переносом',
    taskKind: 'arithmetic',
    operations: ['+'],
    numberSpecs: [{ min: 120, max: 799 }, { min: 120, max: 799 }],
    expectedTimeMs: 4300,
    allowNegativeResult: false,
    requiresCarry: true
  },
  {
    id: 'tier7_three_double_add',
    tier: 7,
    label: '3 двузначных',
    taskKind: 'arithmetic',
    operations: ['+'],
    numberSpecs: [{ min: 10, max: 99 }, { min: 10, max: 99 }, { min: 10, max: 99 }],
    expectedTimeMs: 4600,
    allowNegativeResult: false
  },
  {
    id: 'tier8_two_double_one_triple',
    tier: 8,
    label: '2 двузначных + 1 трехзначное',
    taskKind: 'arithmetic',
    operations: ['+'],
    numberSpecs: [{ min: 10, max: 99 }, { min: 10, max: 99 }, { min: 100, max: 999 }],
    expectedTimeMs: 5000,
    allowNegativeResult: false
  },
  {
    id: 'tier9_three_triple_add',
    tier: 9,
    label: '3 трехзначных',
    taskKind: 'arithmetic',
    operations: ['+'],
    numberSpecs: [{ min: 100, max: 999 }, { min: 100, max: 999 }, { min: 100, max: 999 }],
    expectedTimeMs: 5600,
    allowNegativeResult: false
  },
  {
    id: 'tier10_mixed_ops',
    tier: 10,
    label: 'Смешанные + и -',
    taskKind: 'arithmetic',
    operations: ['+', '-'],
    numberSpecs: [{ min: 20, max: 250 }, { min: 10, max: 180 }, { min: 5, max: 150 }],
    expectedTimeMs: 5900,
    allowNegativeResult: false,
    challengeWeight: 1.1
  }
];

export const tierByDifficultyScore = (difficultyScore: number): number => {
  if (difficultyScore <= 10) return 1;
  if (difficultyScore <= 20) return 2;
  if (difficultyScore <= 30) return 3;
  if (difficultyScore <= 40) return 4;
  if (difficultyScore <= 50) return 5;
  if (difficultyScore <= 60) return 6;
  if (difficultyScore <= 70) return 7;
  if (difficultyScore <= 80) return 8;
  if (difficultyScore <= 90) return 9;
  return 10;
};

export const templateById = templates.reduce<Record<TemplateId, DifficultyTemplate>>((acc, template) => {
  acc[template.id] = template;
  return acc;
}, {} as Record<TemplateId, DifficultyTemplate>);

export const createInitialMastery = (): TemplateMasteryMap =>
  templates.reduce<TemplateMasteryMap>((acc, template) => {
    acc[template.id] = 0;
    return acc;
  }, {} as TemplateMasteryMap);
