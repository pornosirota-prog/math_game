import { StrategyGameState } from '../domain/types';

export const STRATEGY_STORAGE_KEY = 'mathgame.strategy.state.v1';

export const loadStrategyState = (): StrategyGameState | null => {
  try {
    const raw = localStorage.getItem(STRATEGY_STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as StrategyGameState;
  } catch {
    return null;
  }
};

export const saveStrategyState = (state: StrategyGameState) => {
  localStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(state));
};
