const DEFAULT_TOLERANCE = 0.01;

const normalizeMathInput = (rawInput: string): string =>
  rawInput
    .replace(/[−﹣－]/g, '-')
    .replace(/[×⋅]/g, '*')
    .replace(/[÷∶]/g, '/')
    .replace(',', '.')
    .trim();

const parseInputNumber = (rawInput: string): number => {
  const normalized = normalizeMathInput(rawInput);
  if (!normalized) return Number.NaN;
  return Number(normalized);
};

const parseLinearExpression = (expression: string): { numbers: number[]; operators: string[] } | null => {
  const compact = normalizeMathInput(expression).replace(/\s+/g, '');
  if (!compact) return null;

  const numbers: number[] = [];
  const operators: string[] = [];
  let index = 0;
  let expectNumber = true;

  while (index < compact.length) {
    if (expectNumber) {
      const start = index;
      if (compact[index] === '-') {
        index += 1;
      }

      let hasDigits = false;
      while (index < compact.length && /\d/.test(compact[index])) {
        hasDigits = true;
        index += 1;
      }

      if (compact[index] === '.') {
        index += 1;
        while (index < compact.length && /\d/.test(compact[index])) {
          hasDigits = true;
          index += 1;
        }
      }

      if (!hasDigits) return null;
      const value = Number(compact.slice(start, index));
      if (!Number.isFinite(value)) return null;
      numbers.push(value);
      expectNumber = false;
      continue;
    }

    const operator = compact[index];
    if (!['+', '-', '*', '/'].includes(operator)) return null;
    operators.push(operator);
    index += 1;
    expectNumber = true;
  }

  if (expectNumber || numbers.length !== operators.length + 1) return null;
  return { numbers, operators };
};

export const evaluateLinearExpression = (expression: string): number => {
  const parsed = parseLinearExpression(expression);
  if (!parsed) return Number.NaN;

  let result = parsed.numbers[0];
  for (let i = 0; i < parsed.operators.length; i += 1) {
    const operator = parsed.operators[i];
    const right = parsed.numbers[i + 1];
    if (operator === '+') result += right;
    else if (operator === '-') result -= right;
    else if (operator === '*') result *= right;
    else if (operator === '/') {
      if (right === 0) return Number.NaN;
      result /= right;
    }
  }

  return result;
};

export const isAnswerCorrect = (
  rawInput: string,
  expectedAnswer: number,
  prompt?: string,
  tolerance = DEFAULT_TOLERANCE
): boolean => {
  const numeric = parseInputNumber(rawInput);
  if (Number.isFinite(numeric) && Math.abs(numeric - expectedAnswer) < tolerance) {
    return true;
  }

  if (!prompt) return false;

  const promptValue = evaluateLinearExpression(prompt);
  return Number.isFinite(numeric) && Number.isFinite(promptValue) && Math.abs(numeric - promptValue) < tolerance;
};

export const normalizeNumericInput = (rawInput: string): number => {
  const normalized = normalizeMathInput(rawInput);
  if (!normalized) return Number.NaN;

  const numeric = Number(normalized);
  if (Number.isFinite(numeric)) return numeric;

  const safeExpressionPattern = /^[\d+\-*/().\s]+$/;
  if (!safeExpressionPattern.test(normalized)) {
    return Number.NaN;
  }

  try {
    // eslint-disable-next-line no-new-func
    const evaluated = Number(new Function(`return (${normalized});`)());
    return Number.isFinite(evaluated) ? evaluated : Number.NaN;
  } catch {
    return Number.NaN;
  }
};
