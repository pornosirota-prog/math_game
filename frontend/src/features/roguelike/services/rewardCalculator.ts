import { Reward, RewardCalculator, RoomType } from '../domain/types';
import { rollRelicChoices } from './relicEngine';

const roomMultiplier: Record<RoomType, number> = {
  fight: 1,
  elite: 2,
  treasure: 1.4,
  event: 0.8,
  rest: 0.4,
  shop: 0.3
};

export class DungeonRewardCalculator implements RewardCalculator {
  calculateBattleReward(params: {
    depth: number;
    roomType: RoomType;
    enemyRarity: 'normal' | 'elite';
    accuracy: number;
    combo: number;
    speedRate: number;
  }): Reward {
    const base = 8 + params.depth * 2;
    const qualityFactor = 0.6 + params.accuracy * 0.7 + Math.min(0.8, params.combo * 0.06) + params.speedRate * 0.4;
    const rarityFactor = params.enemyRarity === 'elite' ? 1.5 : 1;
    const gold = Math.max(5, Math.round(base * qualityFactor * roomMultiplier[params.roomType] * rarityFactor));
    const crystals = Math.max(0, Math.round((params.depth / 5) * qualityFactor * (params.enemyRarity === 'elite' ? 2 : 1)));
    const relicChance = Math.min(0.55, 0.12 + params.depth * 0.015 + (params.enemyRarity === 'elite' ? 0.24 : 0));

    return {
      gold,
      crystals,
      heal: 0,
      relicChoices: Math.random() < relicChance ? rollRelicChoices(3) : [],
      source: params.roomType
    };
  }
}
