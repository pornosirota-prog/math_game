const test = require('node:test');
const assert = require('node:assert/strict');

const { BattleEngine, LinearDifficultyStrategy } = require('../.tmp-strategy-tests/features/strategy/services/battleEngine.js');
const { DefaultRewardCalculator } = require('../.tmp-strategy-tests/features/strategy/services/rewardCalculator.js');
const { STRATEGY_STORAGE_KEY } = require('../.tmp-strategy-tests/features/strategy/config/strategyConfig.js');
const {
  createInitialStrategyState,
  startBattle,
  submitBattleAnswer
} = require('../.tmp-strategy-tests/features/strategy/store/strategyGameStore.js');
const { countCapturedTerritories } = require('../.tmp-strategy-tests/features/strategy/domain/map.js');

class StubGenerator {
  constructor() {
    this.taskId = 0;
  }

  generateTask() {
    this.taskId += 1;
    return { id: `task-${this.taskId}`, prompt: '2 + 2', answer: 4 };
  }
}

test('battle generation and capture progress respond to answers', () => {
  const engine = new BattleEngine(new StubGenerator(), new LinearDifficultyStrategy());
  const session = engine.createSession('t-1', 1, 1000);
  const correct = engine.applyAnswer(session, 1, { submittedAnswer: '4', timeSpentMs: 1200 });
  const wrong = engine.applyAnswer(correct.session, 1, { submittedAnswer: '9', timeSpentMs: 2200 });

  assert.equal(session.targetTerritoryId, 't-1');
  assert.ok(correct.session.progress > 0);
  assert.equal(correct.isCorrect, true);
  assert.equal(wrong.isCorrect, false);
  assert.ok(wrong.session.progress < correct.session.progress);
});

test('reward calculation scales with strong performance', () => {
  const calculator = new DefaultRewardCalculator();
  const baseTerritory = {
    id: 't-4',
    name: 'Region 4',
    type: 'plains',
    owner: 'neutral',
    defense: 1,
    neighbors: [],
    rewardProfile: { gold: 20, supplies: 10 }
  };

  const low = calculator.calculate({ territory: baseTerritory, accuracy: 0.5, solved: 5, bestStreak: 1 });
  const high = calculator.calculate({ territory: baseTerritory, accuracy: 1, solved: 18, bestStreak: 8 });

  assert.ok(high.gold > low.gold);
  assert.ok(high.supplies > low.supplies);
});

test('territory state changes after successful battle and strategy state is isolated', () => {
  const initial = createInitialStrategyState();
  const target = initial.map.territories.find((territory) =>
    territory.id !== initial.map.playerStartTerritoryId && territory.neighbors.includes(initial.map.playerStartTerritoryId)
  );

  assert.ok(target);

  let state = startBattle(initial, target.id, 0);
  assert.ok(state.activeBattle);

  for (let i = 1; i <= 6 && state.activeBattle; i += 1) {
    state = submitBattleAnswer(
      state,
      String(state.activeBattle.currentTask.answer),
      i * 1000,
      i * 1000 - 700
    );
  }

  assert.ok(countCapturedTerritories(state.map) > 1);
  assert.ok(state.resources.gold > initial.resources.gold);
  assert.notEqual(STRATEGY_STORAGE_KEY, 'mathflow.customMode.v1');
});
