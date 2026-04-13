import type { DifficultyBand, GeneratedTask, Operation } from '../domain/types';

const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const choose = <T,>(arr: T[]) => arr[rndInt(0, arr.length - 1)];

const createDivisiblePair = (min: number, max: number) => {
  const divisor = Math.max(2, Math.abs(rndInt(min, max)));
  const result = rndInt(2, 12);
  return { left: divisor * result, right: divisor };
};

const apply = (a: number, b: number, op: Operation): number => {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  return a / b;
};

const opWeight = (op: Operation) => (op === '+' ? 0.6 : op === '-' ? 0.8 : op === '*' ? 1.2 : 1.5);

export class ArithmeticTaskGenerator {
  generate(band: DifficultyBand, skill: number): GeneratedTask {
    const terms = rndInt(band.termCount[0], band.termCount[1]);
    const numbers: number[] = [];
    const operations: Operation[] = [];

    for (let i = 0; i < terms; i += 1) {
      numbers.push(rndInt(band.numberRange[0], band.numberRange[1]));
      if (!band.allowNegativeNumbers) {
        numbers[i] = Math.abs(numbers[i]);
      }
      if (i > 0) {
        operations.push(choose(band.operations));
      }
    }

    for (let i = 0; i < operations.length; i += 1) {
      if (operations[i] === '/') {
        const pair = createDivisiblePair(Math.max(2, band.numberRange[0]), Math.max(3, band.numberRange[1]));
        numbers[i] = pair.left;
        numbers[i + 1] = pair.right;
      }
    }

    let expression = `${numbers[0]}`;
    let value = numbers[0];

    for (let i = 0; i < operations.length; i += 1) {
      const op = operations[i];
      const next = numbers[i + 1];
      expression = `${expression} ${op} ${next}`;
      value = apply(value, next, op);
    }

    if (band.allowParentheses && terms >= 3 && Math.random() > 0.55) {
      const first = `${numbers[0]} ${operations[0]} ${numbers[1]}`;
      const tailStart = 2;
      const firstValue = apply(numbers[0], numbers[1], operations[0]);
      expression = `(${first})`;
      value = firstValue;
      for (let i = tailStart - 1; i < operations.length; i += 1) {
        const op = operations[i];
        const next = numbers[i + 1];
        expression = `${expression} ${op} ${next}`;
        value = apply(value, next, op);
      }
    }

    const normalizedAnswer = Number(value.toFixed(2));
    const rating = Number((skill + operations.reduce((sum, op) => sum + opWeight(op), 0)).toFixed(2));

    return {
      id: crypto.randomUUID(),
      kind: 'arithmetic',
      prompt: expression,
      answer: normalizedAnswer,
      difficultyRating: rating,
      timeLimitMs: band.answerTimeLimitMs
    };
  }
}
