import { MathChallenge, MathTaskGenerator } from '../domain/types';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const OPERATIONS = ['+', '-', '*'] as const;

type Operation = (typeof OPERATIONS)[number];

const generateTaskByOperation = (operation: Operation, maxNumber: number): Omit<MathChallenge, 'id'> => {
  if (operation === '*') {
    const left = randomInt(2, Math.max(4, Math.floor(maxNumber / 2)));
    const right = randomInt(2, 12);
    return { prompt: `${left} * ${right}`, answer: left * right };
  }

  if (operation === '-') {
    const left = randomInt(8, maxNumber);
    const right = randomInt(1, left);
    return { prompt: `${left} - ${right}`, answer: left - right };
  }

  const left = randomInt(1, maxNumber);
  const right = randomInt(1, maxNumber);
  return { prompt: `${left} + ${right}`, answer: left + right };
};

export class AdaptiveMathTaskGenerator implements MathTaskGenerator {
  generateTask(capturedTerritories: number): MathChallenge {
    const maxNumber = Math.min(70, 14 + capturedTerritories * 4);
    const operation = OPERATIONS[randomInt(0, OPERATIONS.length - 1)];
    const task = generateTaskByOperation(operation, maxNumber);
    return {
      id: `strategy-task-${crypto.randomUUID()}`,
      ...task
    };
  }
}
