const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialRunState, chooseRoom, resolveBattleAnswer } = require('../.tmp-strategy-tests/features/roguelike/store/runEngine.js');
const { mapRunStateToAnalytics } = require('../.tmp-strategy-tests/features/roguelike/analytics/utils/runAnalyticsMapper.js');
const { buildDepthProfileOption } = require('../.tmp-strategy-tests/features/roguelike/analytics/charts/buildDepthProfileOption.js');
const { getOptionalAsset, resolveOptionalAssetState } = require('../.tmp-strategy-tests/features/roguelike/assets/optionalAssets.js');

test('mapper converts run state into analytics model', () => {
  let state = createInitialRunState();
  state = {
    ...state,
    roomChoices: [{ id: 'fight-1', type: 'fight', title: 'Бой', description: '', risk: 2, rewardHint: '' }]
  };
  state = chooseRoom(state, 'fight-1', 1000);
  const answer = state.activeBattle.currentTask.answer;
  state = resolveBattleAnswer(state, String(answer + 1), 2000);

  const analytics = mapRunStateToAnalytics(state, 12);
  assert.ok(analytics.steps.length >= 1);
  assert.equal(analytics.bestRunDepthProfile.length, 12);
  assert.ok(analytics.mathTypeBreakdown.length >= 5);
});

test('depth profile chart option has series and tooltip', () => {
  const analytics = {
    steps: [{ step: 1, roomType: 'fight', depth: 1, hpAfterRoom: 55 }],
    bestRunDepthProfile: [{ step: 1, depth: 1 }],
    deathInfo: null,
    accuracyByDepth: [],
    errorHeatmap: [],
    mathTypeBreakdown: [],
    summary: { depthReached: 1, enemiesDefeated: 0, roomsCleared: 0, gold: 0, crystals: 0, maxStreak: 0, accuracy: 1, durationMs: 1000, deathReason: 'none' },
    sourceState: { status: 'room-choice' }
  };

  const option = buildDepthProfileOption(analytics, true);
  assert.equal(option.series.length, 2);
  assert.ok(option.tooltip);
});

test('optional asset resolver keeps public paths and reports statuses', () => {
  assert.equal(getOptionalAsset('/assets/dungeon/ui/frame-top.webp'), '/assets/dungeon/ui/frame-top.webp');
  assert.equal(getOptionalAsset(null), null);
  assert.equal(resolveOptionalAssetState(false, false), 'loading');
  assert.equal(resolveOptionalAssetState(false, true), 'missing');
  assert.equal(resolveOptionalAssetState(true, false), 'loaded');
});
