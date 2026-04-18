const DEFAULT_TOLERANCE = 0.01;

const parseInputNumber = (rawInput: string): number => {
  const normalized = rawInput.replace(',', '.').trim();
  if (!normalized) return Number.NaN;
  return Number(normalized);
};

const expressionPattern = /^\s*-?\d+(?:\.\d+)?(?:\s*[+\-*/]\s*-?\d+(?:\.\d+)?)*\s*$/;

const parseLinearExpression = (expression: string): { numbers: number[]; operators: string[] } | null => {
  if (!expressionPattern.test(expression)) return null;

  const compact = expression.replace(/\s+/g, '');
  const numbers = compact.split(/[+\-*/]/).map(Number);
  const operators = compact.match(/[+\-*/]/g) ?? [];

  if (numbers.length !== operators.length + 1 || numbers.some((value) => !Number.isFinite(value))) {
    return null;
  }

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
  const normalized = rawInput.replace(',', '.').trim();
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
