import type { DifficultyTemplate, GeneratedTask, Operation } from '../domain/types';

const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const choose = <T,>(arr: T[]) => arr[rndInt(0, arr.length - 1)];

const apply = (a: number, b: number, op: Operation): number => {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  return a / b;
};

const hasCarryInAddition = (a: number, b: number): boolean => {
  let left = a;
  let right = b;
  while (left > 0 || right > 0) {
    if ((left % 10) + (right % 10) >= 10) {
      return true;
    }
    left = Math.floor(left / 10);
    right = Math.floor(right / 10);
  }
  return false;
};

const generateAdditionPair = (template: DifficultyTemplate): [number, number] => {
  const [firstSpec, secondSpec] = template.numberSpecs;

  for (let i = 0; i < 250; i += 1) {
    const a = rndInt(firstSpec.min, firstSpec.max);
    const b = rndInt(secondSpec.min, secondSpec.max);
    const hasCarry = hasCarryInAddition(a, b);
    if (template.requiresCarry === undefined || template.requiresCarry === hasCarry) {
      return [a, b];
    }
  }

  return [rndInt(firstSpec.min, firstSpec.max), rndInt(secondSpec.min, secondSpec.max)];
};

export class ArithmeticTaskGenerator {
  generate(template: DifficultyTemplate, difficultyScore: number): GeneratedTask {
    const numbers =
      template.operations.length === 1 && template.operations[0] === '+' && template.numberSpecs.length === 2
        ? generateAdditionPair(template)
        : template.numberSpecs.map((spec) => rndInt(spec.min, spec.max));

    const operations = Array.from({ length: Math.max(0, numbers.length - 1) }, () => choose(template.operations));

    let value = numbers[0];
    let expression = `${numbers[0]}`;

    for (let i = 0; i < operations.length; i += 1) {
      const op = operations[i];
      const right = numbers[i + 1];
      if (op === '-' && !template.allowNegativeResult && value - right < 0) {
        numbers[i + 1] = rndInt(1, Math.max(1, value));
      }
      expression = `${expression} ${op} ${numbers[i + 1]}`;
      value = apply(value, numbers[i + 1], op);
    }

    const difficultyRating = Number((template.tier + difficultyScore / 25 + (template.challengeWeight ?? 1)).toFixed(2));

    return {
      id: crypto.randomUUID(),
      kind: template.taskKind,
      prompt: expression,
      answer: Number(value.toFixed(2)),
      difficultyRating,
      timeLimitMs: Math.round(template.expectedTimeMs * 1.5),
      templateId: template.id,
      tier: template.tier,
      expectedTimeMs: template.expectedTimeMs,
      modifier: 'normal'
    };
  }
}
