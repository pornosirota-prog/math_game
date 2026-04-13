import type { DifficultyBand, GeneratedTask } from '../domain/types';

const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export class EquationTaskGenerator {
  generate(band: DifficultyBand, skill: number): GeneratedTask {
    const x = rndInt(2, 20);
    const offset = rndInt(1, 15);
    const left = x + offset;
    return {
      id: crypto.randomUUID(),
      kind: 'equation',
      prompt: `x + ${offset} = ${left}`,
      answer: x,
      difficultyRating: Number((skill + 2.4).toFixed(2)),
      timeLimitMs: Math.max(3000, band.answerTimeLimitMs - 400)
    };
  }
}
