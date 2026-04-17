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

interface GenerationOptions {
  recentPrompts?: string[];
  recentAnswers?: number[];
}

const isIntegerResult = (value: number): boolean => Math.abs(value - Math.round(value)) < 1e-9;

const generateGuaranteedIntegerFallback = (template: DifficultyTemplate): { prompt: string; answer: number } => {
  const leftSpec = template.numberSpecs[0];
  const rightSpec = template.numberSpecs[1];
  const preferredOperation = template.operations[0] ?? '+';

  if (!leftSpec || !rightSpec) {
    return { prompt: '2 + 2', answer: 4 };
  }

  if (preferredOperation === '/') {
    for (let attempt = 0; attempt < 250; attempt += 1) {
      const divisor = rndInt(Math.max(1, rightSpec.min), Math.max(1, rightSpec.max));
      const minQuotient = Math.max(1, Math.ceil(leftSpec.min / divisor));
      const maxQuotient = Math.max(minQuotient, Math.floor(leftSpec.max / divisor));
      if (minQuotient > maxQuotient) {
        continue;
      }

      const quotient = rndInt(minQuotient, maxQuotient);
      const dividend = divisor * quotient;
      if (dividend >= leftSpec.min && dividend <= leftSpec.max) {
        return { prompt: `${dividend} / ${divisor}`, answer: quotient };
      }
    }
  }

  const left = rndInt(leftSpec.min, leftSpec.max);
  const right = preferredOperation === '-' && !template.allowNegativeResult
    ? (() => {
        const minRight = Math.max(rightSpec.min, 1);
        const maxRight = Math.min(rightSpec.max, Math.max(1, left));
        return rndInt(minRight, Math.max(minRight, maxRight));
      })()
    : rndInt(rightSpec.min, rightSpec.max);
  const safeRight = preferredOperation === '/' && right === 0 ? 1 : right;
  const answer = apply(left, safeRight, preferredOperation);
  if (isIntegerResult(answer)) {
    return {
      prompt: `${left} ${preferredOperation} ${safeRight}`,
      answer: Math.round(answer)
    };
  }

  const normalizedRight = Math.max(1, Math.abs(safeRight));
  const normalizedLeft = normalizedRight * rndInt(1, 12);
  return {
    prompt: `${normalizedLeft} / ${normalizedRight}`,
    answer: Math.round(normalizedLeft / normalizedRight)
  };
};

const isTooSimilar = (prompt: string, answer: number, options?: GenerationOptions): boolean => {
  if (!options) return false;
  const compactPrompt = prompt.replace(/\s+/g, ' ').trim();
  const hasPromptRepeat = options.recentPrompts?.includes(compactPrompt) ?? false;
  const hasSameAnswer = options.recentAnswers?.some((item) => Math.abs(item - answer) < 0.01) ?? false;
  return hasPromptRepeat || hasSameAnswer;
};

export class ArithmeticTaskGenerator {
  generate(template: DifficultyTemplate, difficultyScore: number, options?: GenerationOptions): GeneratedTask {
    for (let attempt = 0; attempt < 8; attempt += 1) {
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
        if (op === '/' && numbers[i + 1] !== 0) {
          const limitedDivisor = Math.max(1, Math.abs(numbers[i + 1]));
          const safeBase = Math.max(1, Math.abs(Math.round(value)));
          const divisors: number[] = [];
          for (let candidate = 1; candidate <= Math.min(limitedDivisor, safeBase); candidate += 1) {
            if (safeBase % candidate === 0) divisors.push(candidate);
          }
          numbers[i + 1] = divisors.length > 0 ? choose(divisors) : 1;
        }
        expression = `${expression} ${op} ${numbers[i + 1]}`;
        value = apply(value, numbers[i + 1], op);
      }

      if (!isIntegerResult(value)) {
        continue;
      }

      const answer = Math.round(value);
      if (attempt < 7 && isTooSimilar(expression, answer, options)) {
        continue;
      }

      const difficultyRating = Number((template.tier + difficultyScore / 25 + (template.challengeWeight ?? 1)).toFixed(2));

      return {
        id: crypto.randomUUID(),
        kind: template.taskKind,
        prompt: expression,
        answer,
        difficultyRating,
        timeLimitMs: Math.round(template.expectedTimeMs * 1.5),
        templateId: template.id,
        tier: template.tier,
        expectedTimeMs: template.expectedTimeMs,
        modifier: 'normal'
      };
    }

    for (let fallbackAttempt = 0; fallbackAttempt < 16; fallbackAttempt += 1) {
      const fallback = template.numberSpecs.map((spec) => rndInt(spec.min, spec.max));
      const op = template.operations[0] ?? '+';
      const fallbackPrompt = fallback.slice(1).reduce((expr, num) => `${expr} ${op} ${num}`, `${fallback[0]}`);
      const fallbackAnswerRaw = fallback.slice(1).reduce((acc, num) => apply(acc, num, op), fallback[0]);
      if (!isIntegerResult(fallbackAnswerRaw)) {
        continue;
      }

      return {
        id: crypto.randomUUID(),
        kind: template.taskKind,
        prompt: fallbackPrompt,
        answer: Math.round(fallbackAnswerRaw),
        difficultyRating: Number((template.tier + difficultyScore / 25 + (template.challengeWeight ?? 1)).toFixed(2)),
        timeLimitMs: Math.round(template.expectedTimeMs * 1.5),
        templateId: template.id,
        tier: template.tier,
        expectedTimeMs: template.expectedTimeMs,
        modifier: 'normal'
      };
    }

    return {
      id: crypto.randomUUID(),
      kind: template.taskKind,
      ...generateGuaranteedIntegerFallback(template),
      difficultyRating: Number((template.tier + difficultyScore / 25 + (template.challengeWeight ?? 1)).toFixed(2)),
      timeLimitMs: Math.round(template.expectedTimeMs * 1.5),
      templateId: template.id,
      tier: template.tier,
      expectedTimeMs: template.expectedTimeMs,
      modifier: 'normal'
    };
  }
}
