import { templates, tierByDifficultyScore } from '../config/adaptiveTemplates';
import type { DifficultyTemplate, FlowState, TaskAttempt, TaskKind, TemplateId } from '../domain/types';

export type SessionWave = 'warmup' | 'speed' | 'challenge' | 'recovery';
export type ExampleCategory =
  | 'addition_without_carry'
  | 'addition_with_carry'
  | 'two_digit_addition'
  | 'three_digit_addition'
  | 'mixed_digit_addition'
  | 'subtraction_without_borrow'
  | 'subtraction_with_borrow'
  | 'mixed_operations'
  | 'equation';

export interface SelectionContext {
  roundIndex: number;
}

interface ExampleHistoryEntry {
  templateId: TemplateId;
  category: ExampleCategory;
  answer: number;
  prompt: string;
  createdAt: number;
}

interface TemplateCandidate {
  template: DifficultyTemplate;
  score: number;
  category: ExampleCategory;
}

const HISTORY_LIMIT = 30;

const weightedTierShift = (): number => {
  const roll = Math.random();
  if (roll < 0.62) return 0;
  if (roll < 0.8) return -1;
  if (roll < 0.94) return 1;
  return 2;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const normalizePrompt = (prompt: string): string => prompt.replace(/\s+/g, ' ').trim();

const countDigits = (value: number): number => Math.abs(Math.trunc(value)).toString().length;

const hasLikelyBorrowInSubtraction = (specs: DifficultyTemplate['numberSpecs']): boolean => {
  if (specs.length < 2) return false;
  return specs[0].min % 10 < specs[1].max % 10;
};

const toCategory = (template: DifficultyTemplate): ExampleCategory => {
  if (template.taskKind === 'equation') return 'equation';

  if (template.operations.includes('-') && template.operations.includes('+')) return 'mixed_operations';

  if (template.operations.includes('-')) {
    return hasLikelyBorrowInSubtraction(template.numberSpecs) ? 'subtraction_with_borrow' : 'subtraction_without_borrow';
  }

  const maxDigits = Math.max(...template.numberSpecs.map((spec) => countDigits(spec.max)));
  const minDigits = Math.min(...template.numberSpecs.map((spec) => countDigits(spec.min)));

  if (template.requiresCarry === true) return 'addition_with_carry';
  if (template.requiresCarry === false) return 'addition_without_carry';
  if (maxDigits >= 3 && minDigits >= 3) return 'three_digit_addition';
  if (maxDigits === 2 && minDigits === 2) return 'two_digit_addition';
  if (maxDigits !== minDigits) return 'mixed_digit_addition';

  return 'two_digit_addition';
};

export class NextExampleSelector {
  private history: ExampleHistoryEntry[] = [];
  private attempts: TaskAttempt[] = [];

  pick(flow: FlowState, unlockedTaskKinds: TaskKind[], forcedTaskKind?: TaskKind, context?: SelectionContext): DifficultyTemplate {
    const wave = this.resolveWave(flow, context?.roundIndex ?? this.history.length);
    const targetTier = tierByDifficultyScore(flow.difficultyScore);
    const tierByWave = this.resolveTierForWave(targetTier, wave);
    const shiftedTier = clamp(tierByWave + weightedTierShift(), 1, 10);
    const allowedKinds = forcedTaskKind ? [forcedTaskKind] : unlockedTaskKinds;

    const candidates = templates
      .filter((template) => allowedKinds.includes(template.taskKind))
      .filter((template) => Math.abs(template.tier - shiftedTier) <= 2)
      .map((template) => this.scoreTemplateCandidate(template, flow, shiftedTier, wave));

    if (candidates.length === 0) {
      return (
        templates.find((template) => template.tier === targetTier && allowedKinds.includes(template.taskKind)) ??
        templates.find((template) => allowedKinds.includes(template.taskKind)) ??
        templates[0]
      );
    }

    const viable = candidates.sort((left, right) => right.score - left.score).slice(0, 4);
    return viable[Math.floor(Math.random() * viable.length)].template;
  }

  recordGeneratedExample(payload: { templateId: TemplateId; answer: number; prompt: string }): void {
    const template = templates.find((item) => item.id === payload.templateId);
    if (!template) return;

    this.history.push({
      templateId: payload.templateId,
      category: toCategory(template),
      answer: payload.answer,
      prompt: normalizePrompt(payload.prompt),
      createdAt: Date.now()
    });

    if (this.history.length > HISTORY_LIMIT) {
      this.history = this.history.slice(-HISTORY_LIMIT);
    }
  }

  recordAttempt(attempt: TaskAttempt): void {
    this.attempts.push(attempt);
    if (this.attempts.length > HISTORY_LIMIT) {
      this.attempts = this.attempts.slice(-HISTORY_LIMIT);
    }
  }

  resetSession(): void {
    this.history = [];
    this.attempts = [];
  }

  private resolveWave(flow: FlowState, roundIndex: number): SessionWave {
    if (flow.wrongStreak >= 2) return 'recovery';
    if (roundIndex < 4) return 'warmup';
    if (flow.correctStreak >= 5 && flow.avgAnswerTimeMs <= 2500) return 'challenge';
    if (flow.correctStreak >= 3 && flow.avgAnswerTimeMs <= 3200) return 'speed';
    return 'warmup';
  }

  private resolveTierForWave(targetTier: number, wave: SessionWave): number {
    if (wave === 'recovery') return Math.max(1, targetTier - 1);
    if (wave === 'challenge') return Math.min(10, targetTier + 1);
    if (wave === 'speed') return targetTier;
    return Math.max(1, targetTier - 1);
  }

  private scoreTemplateCandidate(template: DifficultyTemplate, flow: FlowState, shiftedTier: number, wave: SessionWave): TemplateCandidate {
    const category = toCategory(template);
    const tierFitScore = Math.max(0, 30 - Math.abs(template.tier - shiftedTier) * 10);
    const mastery = flow.templateMastery[template.id] ?? 0;
    const weakSkillNeed = this.weakSkillWeight(category);
    const noveltyScore = this.noveltyScore(template.id, category);
    const antiRepetitionScore = this.antiRepetitionScore(template.id, category);
    const waveFitScore = this.waveFitScore(template, wave);
    const pacingBalance = this.pacingBalanceScore(template, flow);

    const score = tierFitScore + waveFitScore + noveltyScore + antiRepetitionScore + weakSkillNeed + pacingBalance - mastery * 0.12;

    return { template, score, category };
  }

  private noveltyScore(templateId: TemplateId, category: ExampleCategory): number {
    const recent = this.history.slice(-6);
    const sameTemplateCount = recent.filter((entry) => entry.templateId === templateId).length;
    const sameCategoryCount = recent.filter((entry) => entry.category === category).length;

    return 12 - sameTemplateCount * 7 - sameCategoryCount * 3;
  }

  private antiRepetitionScore(templateId: TemplateId, category: ExampleCategory): number {
    const recent = this.history.slice(-4);
    const last = recent[recent.length - 1];
    const secondLast = recent[recent.length - 2];

    let score = 10;
    if (last?.templateId === templateId) score -= 10;
    if (secondLast?.templateId === templateId) score -= 6;
    if (last?.category === category && secondLast?.category === category) score -= 5;

    return score;
  }

  private weakSkillWeight(category: ExampleCategory): number {
    const relevantAttempts = this.attempts
      .slice(-18)
      .filter((attempt) => {
        const template = templates.find((item) => item.id === attempt.templateId);
        return template ? toCategory(template) === category : false;
      });

    if (relevantAttempts.length < 2) return 4;

    const accuracy = relevantAttempts.filter((attempt) => attempt.isCorrect).length / relevantAttempts.length;
    const avgSpeedRatio =
      relevantAttempts.reduce((acc, attempt) => acc + attempt.expectedTimeMs / Math.max(250, attempt.answerMs), 0) /
      relevantAttempts.length;

    const weakness = (1 - accuracy) * 12 + (avgSpeedRatio < 0.9 ? (0.9 - avgSpeedRatio) * 10 : 0);
    return clamp(Math.round(weakness), 0, 14);
  }

  private waveFitScore(template: DifficultyTemplate, wave: SessionWave): number {
    if (wave === 'recovery') return template.expectedTimeMs <= 3500 ? 12 : -4;
    if (wave === 'speed') return template.expectedTimeMs <= 4500 ? 10 : -2;
    if (wave === 'challenge') return template.tier >= 6 || template.challengeWeight ? 10 : 2;
    return template.expectedTimeMs <= 4200 ? 8 : 2;
  }

  private pacingBalanceScore(template: DifficultyTemplate, flow: FlowState): number {
    const expected = template.expectedTimeMs;
    const avg = flow.avgAnswerTimeMs || expected;
    const diff = Math.abs(expected - avg);
    if (diff <= 700) return 8;
    if (diff <= 1500) return 4;
    return -2;
  }
}
