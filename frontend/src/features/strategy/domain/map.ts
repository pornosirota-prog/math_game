import { STRATEGY_CONSTANTS } from '../config/strategyConfig';
import { StrategyMap, Territory, TerritoryType } from './types';

const TERRITORY_TYPES: TerritoryType[] = ['plains', 'forest', 'mountain'];

const territoryName = (index: number) => `Region ${index + 1}`;

const getNeighbors = (index: number): string[] => {
  const row = Math.floor(index / STRATEGY_CONSTANTS.MAP_COLUMNS);
  const col = index % STRATEGY_CONSTANTS.MAP_COLUMNS;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push(index - STRATEGY_CONSTANTS.MAP_COLUMNS);
  if (row < STRATEGY_CONSTANTS.MAP_ROWS - 1) neighbors.push(index + STRATEGY_CONSTANTS.MAP_COLUMNS);
  if (col > 0) neighbors.push(index - 1);
  if (col < STRATEGY_CONSTANTS.MAP_COLUMNS - 1) neighbors.push(index + 1);

  return neighbors.map((n) => `t-${n}`);
};

const territoryReward = (type: TerritoryType) => {
  if (type === 'mountain') return { gold: 36, supplies: 10 };
  if (type === 'forest') return { gold: 24, supplies: 18 };
  return { gold: 28, supplies: 14 };
};

export const createInitialMap = (): StrategyMap => {
  const centerIndex = Math.floor((STRATEGY_CONSTANTS.MAP_COLUMNS * STRATEGY_CONSTANTS.MAP_ROWS) / 2);

  const territories: Territory[] = Array.from(
    { length: STRATEGY_CONSTANTS.MAP_COLUMNS * STRATEGY_CONSTANTS.MAP_ROWS },
    (_, index) => {
      const type = TERRITORY_TYPES[index % TERRITORY_TYPES.length];
      return {
        id: `t-${index}`,
        name: territoryName(index),
        type,
        owner: index === centerIndex ? 'player' : 'neutral',
        defense: type === 'mountain' ? 1.15 : type === 'forest' ? 1.05 : 1,
        rewardProfile: territoryReward(type),
        neighbors: getNeighbors(index)
      };
    }
  );

  return {
    territories,
    playerStartTerritoryId: `t-${centerIndex}`
  };
};

export const isTerritoryAttackable = (map: StrategyMap, territoryId: string): boolean => {
  const target = map.territories.find((territory) => territory.id === territoryId);
  if (!target || target.owner === 'player') return false;

  return target.neighbors.some((neighborId) => {
    const neighbor = map.territories.find((territory) => territory.id === neighborId);
    return neighbor?.owner === 'player';
  });
};

export const countCapturedTerritories = (map: StrategyMap): number =>
  map.territories.filter((territory) => territory.owner === 'player').length;

export const captureTerritory = (map: StrategyMap, territoryId: string): StrategyMap => ({
  ...map,
  territories: map.territories.map((territory) =>
    territory.id === territoryId ? { ...territory, owner: 'player' } : territory
  )
});
