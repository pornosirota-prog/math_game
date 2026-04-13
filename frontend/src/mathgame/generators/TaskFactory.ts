import type { FlowState, GeneratedTask, TaskKind } from '../domain/types';
import { ArithmeticTaskGenerator } from './ArithmeticTaskGenerator';
import { EquationTaskGenerator } from './EquationTaskGenerator';
import { NextExampleSelector } from '../systems/NextExampleSelector';

export class TaskFactory {
  private arithmetic = new ArithmeticTaskGenerator();
  private equations = new EquationTaskGenerator();
  private selector = new NextExampleSelector();

  next(flow: FlowState, unlockedTaskKinds: TaskKind[]): GeneratedTask {
    const template = this.selector.pick(flow, unlockedTaskKinds);
    if (template.taskKind === 'equation') {
      return this.equations.generate(template, flow.difficultyScore);
    }

    return this.arithmetic.generate(template, flow.difficultyScore);
  }
}
