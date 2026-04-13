import type { DifficultyTemplate, GeneratedTask } from '../domain/types';

const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export class EquationTaskGenerator {
  generate(template: DifficultyTemplate, difficultyScore: number): GeneratedTask {
    const x = rndInt(template.numberSpecs[0]?.min ?? 2, template.numberSpecs[0]?.max ?? 20);
    const offset = rndInt(template.numberSpecs[1]?.min ?? 1, template.numberSpecs[1]?.max ?? 15);
    const operation = template.operations[Math.floor(Math.random() * template.operations.length)] ?? '+';
    const left = operation === '-' ? x - offset : x + offset;
    const prompt = operation === '-' ? `x - ${offset} = ${left}` : `x + ${offset} = ${left}`;
    return {
      id: crypto.randomUUID(),
      kind: 'equation',
      prompt,
      answer: x,
      difficultyRating: Number((template.tier + difficultyScore / 20).toFixed(2)),
      timeLimitMs: Math.max(3000, Math.round(template.expectedTimeMs * 1.3)),
      templateId: template.id,
      tier: template.tier,
      expectedTimeMs: template.expectedTimeMs,
      modifier: 'normal'
    };
  }
}
