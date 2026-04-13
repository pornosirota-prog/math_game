import type { FlowState, GeneratedTask, TaskKind, TaskModifier } from '../domain/types';
import { ArithmeticTaskGenerator } from './ArithmeticTaskGenerator';
import { EquationTaskGenerator } from './EquationTaskGenerator';
import { NextExampleSelector } from '../systems/NextExampleSelector';

export class TaskFactory {
  private arithmetic = new ArithmeticTaskGenerator();
  private equations = new EquationTaskGenerator();
  private selector = new NextExampleSelector();

  next(flow: FlowState, unlockedTaskKinds: TaskKind[], forcedTaskKind?: TaskKind): GeneratedTask {
    const template = this.selector.pick(flow, unlockedTaskKinds, forcedTaskKind);
    const base =
      template.taskKind === 'equation'
        ? this.equations.generate(template, flow.difficultyScore)
        : this.arithmetic.generate(template, flow.difficultyScore);

    return this.applyModifier(base);
  }

  private applyModifier(task: GeneratedTask): GeneratedTask {
    const roll = Math.random();
    let modifier: TaskModifier = 'normal';

    if (roll < 0.05) modifier = 'golden';
    else if (roll < 0.09) modifier = 'blitz';
    else if (roll < 0.12) modifier = 'shield';
    else if (roll < 0.15) modifier = 'double3';

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
    return { ...task, modifier, modifierLabel: 'x2 for next 3' };
  }
}
