import { STARTING_RESOURCES, STRATEGY_CONSTANTS } from '../config/strategyConfig';
import { captureTerritory, countCapturedTerritories, createInitialMap, isTerritoryAttackable } from '../domain/map';
import { BattleSummary, ResourcePool, StrategyActionLogEntry, StrategyGameState, Territory } from '../domain/types';
import { BattleEngine, LinearDifficultyStrategy } from '../services/battleEngine';
import { AdaptiveMathTaskGenerator } from '../services/mathChallenge';
import { DefaultRewardCalculator } from '../services/rewardCalculator';

const battleEngine = new BattleEngine(new AdaptiveMathTaskGenerator(), new LinearDifficultyStrategy());
const rewardCalculator = new DefaultRewardCalculator();

const mergeResources = (left: ResourcePool, right: ResourcePool): ResourcePool => ({
  gold: left.gold + right.gold,
  supplies: left.supplies + right.supplies
});

const createLogEntry = (text: string): StrategyActionLogEntry => ({
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  text
});

const getTerritoryById = (state: StrategyGameState, territoryId: string): Territory | null =>
  state.map.territories.find((territory) => territory.id === territoryId) ?? null;

export const createInitialStrategyState = (): StrategyGameState => ({
  map: createInitialMap(),
  resources: STARTING_RESOURCES,
  selectedTerritoryId: null,
  activeBattle: null,
  lastSummary: null,
  actionLog: [createLogEntry('Командный центр готов к расширению территории.')] 
});

const appendLog = (state: StrategyGameState, text: string): StrategyGameState => ({
  ...state,
  actionLog: [createLogEntry(text), ...state.actionLog].slice(0, STRATEGY_CONSTANTS.LOG_LIMIT)
});

export const selectTerritory = (state: StrategyGameState, territoryId: string): StrategyGameState => ({
  ...state,
  selectedTerritoryId: territoryId
});

export const startBattle = (state: StrategyGameState, targetTerritoryId: string, now = Date.now()): StrategyGameState => {
  if (!isTerritoryAttackable(state.map, targetTerritoryId)) {
    return appendLog(state, 'Можно атаковать только соседние нейтральные территории.');
  }

  const capturedTerritories = countCapturedTerritories(state.map);
  const session = battleEngine.createSession(targetTerritoryId, capturedTerritories, now);

  return appendLog(
    {
      ...state,
      selectedTerritoryId: targetTerritoryId,
      activeBattle: session,
      lastSummary: null
    },
    `Началась атака на ${getTerritoryById(state, targetTerritoryId)?.name ?? targetTerritoryId}.`
  );
};

export const submitBattleAnswer = (
  state: StrategyGameState,
  answer: string,
  now: number,
  questionStartedAt: number
): StrategyGameState => {
  if (!state.activeBattle || state.activeBattle.isFinished) return state;

  const capturedTerritories = countCapturedTerritories(state.map);
  const resolution = battleEngine.applyAnswer(state.activeBattle, capturedTerritories, {
    submittedAnswer: answer,
    timeSpentMs: Math.max(0, now - questionStartedAt)
  });

  const updatedState = {
    ...state,
    activeBattle: resolution.session
  };

  if (resolution.session.isFinished) {
    return completeBattle(updatedState);
  }

  return appendLog(
    updatedState,
    resolution.isCorrect
      ? `Верно: +${resolution.gainedProgress}% прогресса захвата.`
      : `Промах: ${Math.abs(resolution.gainedProgress)}% штрафа и сброс серии.`
  );
};

export const tickBattle = (state: StrategyGameState, now: number): StrategyGameState => {
  if (!state.activeBattle || state.activeBattle.isFinished) return state;
  if (now < state.activeBattle.endsAt) return state;

  const timedOutSession = battleEngine.markTimeout(state.activeBattle);
  return completeBattle({ ...state, activeBattle: timedOutSession });
};

const completeBattle = (state: StrategyGameState): StrategyGameState => {
  const battle = state.activeBattle;
  if (!battle) return state;

  const targetTerritory = getTerritoryById(state, battle.targetTerritoryId);
  if (!targetTerritory) {
    return appendLog({ ...state, activeBattle: null }, 'Территория не найдена, бой завершён без результата.');
  }

  const accuracy = battle.solved === 0 ? 0 : battle.correct / battle.solved;
  let gainedResources: ResourcePool = { gold: 0, supplies: 0 };
  let updatedMap = state.map;

  if (battle.wasVictorious) {
    gainedResources = rewardCalculator.calculate({
      territory: targetTerritory,
      accuracy,
      solved: battle.solved,
      bestStreak: battle.bestStreak
    });
    updatedMap = captureTerritory(state.map, battle.targetTerritoryId);
  }

  const summary: BattleSummary = {
    win: battle.wasVictorious,
    capturedTerritory: battle.wasVictorious,
    gainedResources,
    accuracy,
    totalSolved: battle.solved,
    comboBest: battle.bestStreak
  };

  const nextState: StrategyGameState = {
    ...state,
    map: updatedMap,
    resources: mergeResources(state.resources, gainedResources),
    activeBattle: null,
    lastSummary: summary
  };

  return appendLog(
    nextState,
    battle.wasVictorious
      ? `Территория ${targetTerritory.name} захвачена. Награда: +${gainedResources.gold} золота, +${gainedResources.supplies} припасов.`
      : `Атака на ${targetTerritory.name} не удалась. Подготовьте новую попытку.`
  );
};
