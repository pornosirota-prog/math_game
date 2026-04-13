import { difficultyBands, SKILL_CEILING, SKILL_FLOOR } from '../config/difficultyBands';
import type { DifficultyBand, GeneratedTask, TaskKind } from '../domain/types';
import { ArithmeticTaskGenerator } from './ArithmeticTaskGenerator';
import { EquationTaskGenerator } from './EquationTaskGenerator';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const pickBand = (skill: number): DifficultyBand => {
  const normalized = clamp(skill, SKILL_FLOOR, SKILL_CEILING);
  return difficultyBands.find((band) => normalized >= band.minSkill && normalized <= band.maxSkill) ?? difficultyBands[0];
};

export class TaskFactory {
  private arithmetic = new ArithmeticTaskGenerator();
  private equations = new EquationTaskGenerator();

  next(skill: number, unlockedTaskKinds: TaskKind[]): GeneratedTask {
    const band = pickBand(skill);
    const availableKinds = band.taskKinds.filter((kind) => unlockedTaskKinds.includes(kind));
    const selectedKind = availableKinds.length > 0 ? availableKinds[Math.floor(Math.random() * availableKinds.length)] : 'arithmetic';

    if (selectedKind === 'equation') {
      return this.equations.generate(band, skill);
    }

    const shouldChallenge = Math.random() < band.challengeChance;
    const challengeSkill = shouldChallenge ? Math.min(SKILL_CEILING, skill + 1.2) : skill;
    return this.arithmetic.generate(band, challengeSkill);
  }
}
