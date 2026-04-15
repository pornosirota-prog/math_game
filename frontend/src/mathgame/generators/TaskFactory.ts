import type { FlowState, GeneratedTask, TaskAttempt, TaskKind, TaskModifier } from '../domain/types';
import { ArithmeticTaskGenerator } from './ArithmeticTaskGenerator';
import { EquationTaskGenerator } from './EquationTaskGenerator';
import { NextExampleSelector, type SelectionContext } from '../systems/NextExampleSelector';

const HISTORY_LIMIT = 16;

type SpecialType = 'normal' | 'golden' | 'blitz' | 'shield' | 'double3' | 'recovery' | 'boss';

const normalizePrompt = (prompt: string): string => prompt.replace(/\s+/g, ' ').trim();

export class TaskFactory {
  private arithmetic = new ArithmeticTaskGenerator();
  private equations = new EquationTaskGenerator();
  private selector = new NextExampleSelector();
  private recentTasks: GeneratedTask[] = [];
  private recentAttempts: TaskAttempt[] = [];

  next(flow: FlowState, unlockedTaskKinds: TaskKind[], forcedTaskKind?: TaskKind, context?: SelectionContext): GeneratedTask {
    const template = this.selector.pick(flow, unlockedTaskKinds, forcedTaskKind, context);

    const recentPrompts = this.recentTasks.slice(-6).map((task) => normalizePrompt(task.prompt));
    const recentAnswers = this.recentTasks.slice(-6).map((task) => task.answer);

    const base =
      template.taskKind === 'equation'
        ? this.equations.generate(template, flow.difficultyScore, { recentPrompts, recentAnswers })
        : this.arithmetic.generate(template, flow.difficultyScore, { recentPrompts, recentAnswers });

    const withModifier = this.applyModifier(base, flow, context?.roundIndex ?? this.recentTasks.length);

    this.recentTasks.push(withModifier);
    if (this.recentTasks.length > HISTORY_LIMIT) {
      this.recentTasks = this.recentTasks.slice(-HISTORY_LIMIT);
    }

    this.selector.recordGeneratedExample({
      templateId: withModifier.templateId,
      prompt: withModifier.prompt,
      answer: withModifier.answer
    });

    return withModifier;
  }

  recordAttempt(attempt: TaskAttempt): void {
    this.recentAttempts.push(attempt);
    if (this.recentAttempts.length > HISTORY_LIMIT) {
      this.recentAttempts = this.recentAttempts.slice(-HISTORY_LIMIT);
    }
    this.selector.recordAttempt(attempt);
  }

  resetSession(): void {
    this.recentTasks = [];
    this.recentAttempts = [];
    this.selector.resetSession();
  }

  private applyModifier(task: GeneratedTask, flow: FlowState, roundIndex: number): GeneratedTask {
    const specialType = this.resolveSpecialType(flow, roundIndex);
    const modifier = specialType as TaskModifier;

    if (modifier === 'normal') return task;

    if (modifier === 'golden') {
      return { ...task, modifier, modifierLabel: 'Golden ×2.5' };
    }
    if (modifier === 'blitz') {
      return { ...task, modifier, modifierLabel: 'Blitz ≤55% time', timeLimitMs: Math.max(1200, Math.round(task.timeLimitMs * 0.7)) };
    }
    if (modifier === 'shield') {
      return { ...task, modifier, modifierLabel: 'Shield charge' };
    }
    if (modifier === 'double3') {
      return { ...task, modifier, modifierLabel: 'x2 for next 3' };
    }
    if (modifier === 'recovery') {
      return {
        ...task,
        modifier,
        modifierLabel: 'Recovery',
        timeLimitMs: Math.round(task.timeLimitMs * 1.2),
        difficultyRating: Number((task.difficultyRating * 0.9).toFixed(2))
      };
    }

    return {
      ...task,
      modifier: 'boss',
      modifierLabel: 'Boss challenge',
      timeLimitMs: Math.round(task.timeLimitMs * 1.1),
      difficultyRating: Number((task.difficultyRating * 1.15).toFixed(2))
    };
  }

  private resolveSpecialType(flow: FlowState, roundIndex: number): SpecialType {
    if (flow.wrongStreak >= 2) return 'recovery';
    if (roundIndex > 0 && roundIndex % 12 === 0) return 'boss';

    const roll = Math.random();
    if (roll < 0.05) return 'golden';
    if (roll < 0.09) return 'blitz';
    if (roll < 0.12) return 'shield';
    if (roll < 0.15) return 'double3';

    return 'normal';
  }
}
