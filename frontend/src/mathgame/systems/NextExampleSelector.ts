import { templates, tierByDifficultyScore } from '../config/adaptiveTemplates';
import type { DifficultyTemplate, FlowState, TaskKind } from '../domain/types';

const weightedTierShift = (): number => {
  const roll = Math.random();
  if (roll < 0.7) return 0;
  if (roll < 0.9) return -1;
  return 1;
};

export class NextExampleSelector {
  pick(flow: FlowState, unlockedTaskKinds: TaskKind[], forcedTaskKind?: TaskKind): DifficultyTemplate {
    const targetTier = tierByDifficultyScore(flow.difficultyScore);
    const shiftedTier = Math.min(10, Math.max(1, targetTier + weightedTierShift()));
    const allowedKinds = forcedTaskKind ? [forcedTaskKind] : unlockedTaskKinds;
    const allowed = templates.filter((template) => template.tier === shiftedTier && allowedKinds.includes(template.taskKind));

    if (allowed.length === 0) {
      return (
        templates.find((template) => template.tier === targetTier && allowedKinds.includes(template.taskKind)) ??
        templates.find((template) => allowedKinds.includes(template.taskKind)) ??
        templates[0]
      );
    }

    const ranked = [...allowed].sort((left, right) => {
      const leftMastery = flow.templateMastery[left.id] ?? 0;
      const rightMastery = flow.templateMastery[right.id] ?? 0;
      return leftMastery - rightMastery;
    });

    return ranked[0];
  }
}
