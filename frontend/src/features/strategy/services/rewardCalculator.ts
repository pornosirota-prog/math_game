import { ResourcePool, RewardCalculator, RewardContext } from '../domain/types';

export class DefaultRewardCalculator implements RewardCalculator {
  calculate(context: RewardContext): ResourcePool {
    const accuracyBonus = 1 + context.accuracy * 0.35;
    const streakBonus = 1 + Math.min(0.3, context.bestStreak * 0.03);
    const solvedBonus = 1 + Math.min(0.25, context.solved * 0.01);

    const multiplier = accuracyBonus * streakBonus * solvedBonus;

    return {
      gold: Math.round(context.territory.rewardProfile.gold * multiplier),
      supplies: Math.round(context.territory.rewardProfile.supplies * multiplier)
    };
  }
}
