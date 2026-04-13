import type { DifficultyTemplate, GeneratedTask } from '../domain/types';

const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export class EquationTaskGenerator {
  generate(template: DifficultyTemplate, difficultyScore: number): GeneratedTask {
    const x = rndInt(2, 20);
    const offset = rndInt(1, 15);
    const left = x + offset;
    return {
      id: crypto.randomUUID(),
      kind: 'equation',
      prompt: `x + ${offset} = ${left}`,
      answer: x,
      difficultyRating: Number((template.tier + difficultyScore / 20).toFixed(2)),
      timeLimitMs: Math.max(3000, Math.round(template.expectedTimeMs * 1.3)),
      templateId: template.id,
      tier: template.tier,
      expectedTimeMs: template.expectedTimeMs
    };
  }
}
