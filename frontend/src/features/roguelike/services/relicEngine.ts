import { RELIC_DEFINITIONS } from '../config/relics';
import { PlayerState, RelicDefinition, RelicEffect } from '../domain/types';

const effectByType = (player: PlayerState, effect: RelicEffect): PlayerState => {
  if (effect.type === 'baseDamageFlat') {
    return { ...player, baseDamage: player.baseDamage + effect.value };
  }
  if (effect.type === 'speedBonusPercent') {
    return { ...player, speedBonusMultiplier: player.speedBonusMultiplier + effect.value };
  }
  if (effect.type === 'maxHpFlat') {
    return { ...player, maxHp: player.maxHp + effect.value, hp: player.hp + effect.value };
  }
  return player;
};

export const getRelicById = (id: string): RelicDefinition | undefined =>
  RELIC_DEFINITIONS.find((relic) => relic.id === id);

export const applyRelicToPlayer = (player: PlayerState, relic: RelicDefinition): PlayerState => {
  const withStats = effectByType(player, relic.effect);
  return {
    ...withStats,
    relicIds: withStats.relicIds.includes(relic.id) ? withStats.relicIds : [...withStats.relicIds, relic.id]
  };
};

export const rollRelicChoices = (count = 3): RelicDefinition[] => {
  const shuffled = [...RELIC_DEFINITIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getExtraGoldMultiplier = (player: PlayerState): number => {
  const extra = player.relicIds
    .map((id) => getRelicById(id))
    .filter((item): item is RelicDefinition => Boolean(item))
    .filter((item) => item.effect.type === 'extraGoldPercent')
    .reduce((acc, item) => acc + item.effect.value, 0);
  return 1 + extra;
};

export const getHealAfterVictory = (player: PlayerState): number =>
  player.relicIds
    .map((id) => getRelicById(id))
    .filter((item): item is RelicDefinition => Boolean(item))
    .filter((item) => item.effect.type === 'healAfterVictory')
    .reduce((acc, item) => acc + item.effect.value, 0);

export const hasMistakeForgiveness = (player: PlayerState): boolean =>
  player.relicIds
    .map((id) => getRelicById(id))
    .filter((item): item is RelicDefinition => Boolean(item))
    .some((item) => item.effect.type === 'forgiveMistakeOnce');
