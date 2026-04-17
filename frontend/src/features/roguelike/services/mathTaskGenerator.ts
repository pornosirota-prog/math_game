import { DifficultyBand, MathTask, MathTaskGenerator } from '../domain/types';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: T[]) => items[randomInt(0, items.length - 1)];

const apply = (a: number, b: number, op: '+' | '-' | '*' | '/'): number => {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  return a / b;
};

export class ProceduralMathTaskGenerator implements MathTaskGenerator {
  generate(band: DifficultyBand, now: number): MathTask {
    const left = randomInt(band.min, band.max);
    const rightRaw = randomInt(band.min, band.max);
    const op = pick(band.operations);
    let right = rightRaw;
    let value = left;
    let prompt = `${left} ${op} ${right}`;

    if (op === '/' && right !== 0) {
      const denominator = Math.max(1, rightRaw);
      value = left * denominator;
      right = denominator;
      prompt = `${value} / ${right}`;
    } else {
      value = apply(left, right, op);
    }

    if (band.chained) {
      const op2 = pick(band.operations);
      let right2 = randomInt(Math.max(1, Math.floor(band.min / 2)), band.max);
      if (op2 === '/' && right2 !== 0) {
        value = Math.round(value) * right2;
      }
      prompt = `${prompt} ${op2} ${right2}`;
      value = apply(value, right2, op2);
    }

    return {
      id: `task-${now}-${Math.round(Math.random() * 100000)}`,
      prompt,
      answer: Math.round(value * 100) / 100,
      timeLimitMs: Math.max(2800, 5400 - band.depth * 90),
      tier: band.depth
    };
  }
}
