import type { DifficultyTemplate, GeneratedTask } from '../domain/types';

const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

interface GenerationOptions {
  recentPrompts?: string[];
  recentAnswers?: number[];
}

const isTooSimilar = (prompt: string, answer: number, options?: GenerationOptions): boolean => {
  if (!options) return false;
  const normalizedPrompt = prompt.replace(/\s+/g, ' ').trim();
  const hasPromptRepeat = options.recentPrompts?.includes(normalizedPrompt) ?? false;
  const hasAnswerRepeat = options.recentAnswers?.some((item) => Math.abs(item - answer) < 0.01) ?? false;
  return hasPromptRepeat || hasAnswerRepeat;
};

export class EquationTaskGenerator {
  generate(template: DifficultyTemplate, difficultyScore: number, options?: GenerationOptions): GeneratedTask {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const x = rndInt(template.numberSpecs[0]?.min ?? 2, template.numberSpecs[0]?.max ?? 20);
      const offset = rndInt(template.numberSpecs[1]?.min ?? 1, template.numberSpecs[1]?.max ?? 15);
      const operation = template.operations[Math.floor(Math.random() * template.operations.length)] ?? '+';
      const left = operation === '-' ? x - offset : x + offset;
      const prompt = operation === '-' ? `x - ${offset} = ${left}` : `x + ${offset} = ${left}`;

      if (attempt < 7 && isTooSimilar(prompt, x, options)) {
        continue;
      }

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

    return {
      id: crypto.randomUUID(),
      kind: 'equation',
      prompt: 'x + 1 = 2',
      answer: 1,
      difficultyRating: Number((template.tier + difficultyScore / 20).toFixed(2)),
      timeLimitMs: Math.max(3000, Math.round(template.expectedTimeMs * 1.3)),
      templateId: template.id,
      tier: template.tier,
      expectedTimeMs: template.expectedTimeMs,
      modifier: 'normal'
    };
  }
}
