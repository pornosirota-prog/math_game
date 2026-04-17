const test = require('node:test');
const assert = require('node:assert/strict');

const { MathDifficultyScaler } = require('../.tmp-strategy-tests/features/roguelike/services/difficultyStrategy.js');
const { generateRoomChoices } = require('../.tmp-strategy-tests/features/roguelike/services/roomGenerator.js');
const { DungeonRewardCalculator } = require('../.tmp-strategy-tests/features/roguelike/services/rewardCalculator.js');
const { RELIC_DEFINITIONS } = require('../.tmp-strategy-tests/features/roguelike/config/relics.js');
const { applyRelicToPlayer } = require('../.tmp-strategy-tests/features/roguelike/services/relicEngine.js');
const {
  createInitialRunState,
  chooseRoom,
  resolveBattleAnswer,
  claimReward,
  makeSummary
} = require('../.tmp-strategy-tests/features/roguelike/store/runEngine.js');

test('difficulty scaling grows with depth and unlocks chain tasks', () => {
  const scaler = new MathDifficultyScaler();
  const early = scaler.getBand(2);
  const deep = scaler.getBand(18);

  assert.equal(early.chained, false);
  assert.equal(deep.chained, true);
  assert.ok(deep.max > early.max);
  assert.ok(deep.operations.includes('/'));
});

test('room generator returns three room cards and avoids early elite rooms', () => {
  for (let i = 0; i < 20; i += 1) {
    const rooms = generateRoomChoices(2, ['rest']);
    assert.equal(rooms.length, 3);
    assert.ok(rooms.every((room) => room.type !== 'elite'));
  }
});

test('reward calculator gives higher reward for elite + high performance', () => {
  const calculator = new DungeonRewardCalculator();
  const low = calculator.calculateBattleReward({
    depth: 3,
    roomType: 'fight',
    enemyRarity: 'normal',
    accuracy: 0.5,
    combo: 1,
    speedRate: 0.3
  });
  const high = calculator.calculateBattleReward({
    depth: 9,
    roomType: 'elite',
    enemyRarity: 'elite',
    accuracy: 1,
    combo: 8,
    speedRate: 1
  });

  assert.ok(high.gold > low.gold);
  assert.ok(high.crystals >= low.crystals);
});

test('relic engine applies stat relics', () => {
  const player = {
    hp: 50,
    maxHp: 50,
    armor: 0,
    gold: 0,
    crystals: 0,
    baseDamage: 5,
    speedBonusMultiplier: 0,
    combo: 0,
    bestCombo: 0,
    solved: 0,
    correct: 0,
    mistakesForgivenInBattle: false,
    relicIds: []
  };

  const relic = RELIC_DEFINITIONS.find((item) => item.id === 'iron-chisel');
  assert.ok(relic);
  const upgraded = applyRelicToPlayer(player, relic);
  assert.equal(upgraded.baseDamage, 6);
});

test('run progression transitions battle -> reward and supports death summary', () => {
  let state = createInitialRunState();
  state = {
    ...state,
    roomChoices: [{ id: 'fight-1', type: 'fight', title: 'Бой', description: '', risk: 2, rewardHint: '' }]
  };
  state = chooseRoom(state, 'fight-1', 1000);

  assert.equal(state.status, 'battle');
  assert.ok(state.activeBattle);

  let guard = 0;
  while (state.status === 'battle' && guard < 20) {
    state = resolveBattleAnswer(state, String(state.activeBattle.currentTask.answer), 1500 + guard * 600);
    guard += 1;
  }

  assert.equal(state.status, 'reward');
  const rewarded = claimReward(state);
  assert.equal(rewarded.depth, 2);

  const deadState = {
    ...rewarded,
    player: { ...rewarded.player, hp: 0, solved: 10, correct: 7, bestCombo: 4 },
    depth: 6,
    roomsCleared: 5,
    enemiesDefeated: 3
  };
  const summary = makeSummary(deadState, 9);
  assert.equal(summary.depthReached, 6);
  assert.equal(summary.recordDepth, 9);
  assert.equal(summary.accuracy, 0.7);
});
