import { DungeonRewardCalculator } from '../services/rewardCalculator';
import { MathDifficultyScaler } from '../services/difficultyStrategy';
import { ProceduralMathTaskGenerator } from '../services/mathTaskGenerator';
import { createEnemyForRoom } from '../services/enemyFactory';
import { createEvent } from '../services/eventEngine';
import { createShopOffers } from '../services/shopEngine';
import { applyRelicToPlayer, getExtraGoldMultiplier, getHealAfterVictory } from '../services/relicEngine';
import { createBattleResolver } from '../services/battleEngine';
import { generateRoomChoices } from '../services/roomGenerator';
import { BattleState, RoomDefinition, RoomType, RunState, RunSummary, ShopOffer } from '../domain/types';

const difficulty = new MathDifficultyScaler();
const taskGenerator = new ProceduralMathTaskGenerator();
const rewardCalculator = new DungeonRewardCalculator();
const battleEngine = createBattleResolver(taskGenerator);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const createPlayer = () => ({
  hp: 60,
  maxHp: 60,
  armor: 1,
  gold: 0,
  crystals: 0,
  baseDamage: 5,
  speedBonusMultiplier: 0.2,
  combo: 0,
  bestCombo: 0,
  solved: 0,
  correct: 0,
  mistakesForgivenInBattle: false,
  relicIds: [] as string[]
});

const pushRunLog = (state: RunState, line: string): RunState => ({
  ...state,
  runLog: [line, ...state.runLog].slice(0, 10)
});

const nextRoomChoiceState = (state: RunState): RunState => {
  const history = state.runLog
    .map((line) => line.match(/\[(.+?)\]/)?.[1])
    .filter((item): item is RoomType => ['fight', 'treasure', 'event', 'shop', 'rest', 'elite'].includes(item ?? ''));

  return {
    ...state,
    status: 'room-choice',
    roomChoices: generateRoomChoices(state.depth, history),
    activeRoom: null,
    activeBattle: null,
    activeEvent: null,
    shopOffers: []
  };
};

export const createInitialRunState = (): RunState => ({
  status: 'room-choice',
  depth: 1,
  roomsCleared: 0,
  enemiesDefeated: 0,
  player: createPlayer(),
  roomChoices: generateRoomChoices(1, []),
  activeRoom: null,
  activeBattle: null,
  pendingReward: null,
  activeEvent: null,
  shopOffers: [],
  runLog: ['Новый забег начат. Выберите путь.'],
  summary: null
});

const startBattle = (state: RunState, room: RoomDefinition, now: number): RunState => {
  const enemy = createEnemyForRoom(state.depth, room.type, now);
  const task = taskGenerator.generate(difficulty.getBand(state.depth), now);

  const battle: BattleState = {
    enemy,
    currentTask: task,
    startedAt: now,
    actionLog: [`Встречен враг: ${enemy.name}.`]
  };

  return {
    ...state,
    status: 'battle',
    activeRoom: room,
    activeBattle: battle,
    player: { ...state.player, combo: 0, mistakesForgivenInBattle: false }
  };
};

export const chooseRoom = (state: RunState, roomId: string, now: number): RunState => {
  if (state.status !== 'room-choice') return state;

  const room = state.roomChoices.find((item) => item.id === roomId);
  if (!room) return state;

  const taggedState = pushRunLog(state, `[${room.type}] ${room.title}`);

  if (room.type === 'fight' || room.type === 'elite') {
    return startBattle(taggedState, room, now);
  }

  if (room.type === 'treasure') {
    const gold = 12 + Math.round(Math.random() * 12) + state.depth * 2;
    const crystals = state.depth > 2 ? 1 : 0;
    return {
      ...taggedState,
      status: 'reward',
      activeRoom: room,
      pendingReward: {
        gold,
        crystals,
        heal: 0,
        relicChoices: [],
        source: 'treasure'
      }
    };
  }

  if (room.type === 'event') {
    return {
      ...taggedState,
      status: 'event',
      activeRoom: room,
      activeEvent: createEvent(taggedState)
    };
  }

  if (room.type === 'shop') {
    return {
      ...taggedState,
      status: 'shop',
      activeRoom: room,
      shopOffers: createShopOffers()
    };
  }

  return {
    ...taggedState,
    status: 'rest',
    activeRoom: room
  };
};

export const resolveBattleAnswer = (state: RunState, answer: string, submittedAt: number): RunState => {
  if (state.status !== 'battle' || !state.activeBattle || !state.activeRoom) return state;

  const answerTimeMs = Math.max(0, submittedAt - state.activeBattle.startedAt);
  const output = battleEngine.resolveTurn(state.activeBattle, state.player, answer, answerTimeMs, submittedAt);

  let next: RunState = {
    ...state,
    player: output.player,
    activeBattle: {
      ...output.battle,
      startedAt: submittedAt
    }
  };

  if (output.result.victory) {
    const accuracy = output.player.solved > 0 ? output.player.correct / output.player.solved : 0;
    const speedRate = answerTimeMs <= output.battle.enemy.speedPressureMs ? 1 : 0.4;
    const reward = rewardCalculator.calculateBattleReward({
      depth: state.depth,
      roomType: state.activeRoom.type,
      enemyRarity: output.battle.enemy.rarity,
      accuracy,
      combo: output.player.combo,
      speedRate
    });

    const extraMultiplier = getExtraGoldMultiplier(output.player);
    reward.gold = Math.round(reward.gold * extraMultiplier);

    const healAfterVictory = getHealAfterVictory(output.player);
    next = {
      ...next,
      status: 'reward',
      pendingReward: { ...reward, heal: healAfterVictory },
      roomsCleared: next.roomsCleared + 1,
      enemiesDefeated: next.enemiesDefeated + 1,
      activeBattle: null,
      player: {
        ...next.player,
        hp: clamp(next.player.hp + healAfterVictory, 0, next.player.maxHp)
      }
    };
  }

  if (output.result.defeat) {
    return finishRun({ ...next, status: 'game-over' });
  }

  return pushRunLog(next, output.result.logLine);
};

export const claimReward = (state: RunState, relicId?: string): RunState => {
  if (state.status !== 'reward' || !state.pendingReward) return state;

  let nextPlayer = {
    ...state.player,
    gold: state.player.gold + state.pendingReward.gold,
    crystals: state.player.crystals + state.pendingReward.crystals,
    hp: clamp(state.player.hp + state.pendingReward.heal, 0, state.player.maxHp)
  };

  if (relicId) {
    const relic = state.pendingReward.relicChoices.find((item) => item.id === relicId);
    if (relic) {
      nextPlayer = applyRelicToPlayer(nextPlayer, relic);
    }
  }

  return nextRoomChoiceState({
    ...state,
    player: nextPlayer,
    pendingReward: null,
    depth: state.depth + 1
  });
};

export const resolveEventOption = (state: RunState, optionId: string): RunState => {
  if (state.status !== 'event' || !state.activeEvent) return state;

  const option = state.activeEvent.options.find((item) => item.id === optionId);
  if (!option) return state;

  const applied = option.apply(state);
  if (applied.player.hp <= 0) {
    return finishRun({ ...applied, status: 'game-over' });
  }

  if (applied.pendingReward) {
    return {
      ...applied,
      status: 'reward',
      activeEvent: null,
      depth: state.depth + 1,
      roomsCleared: state.roomsCleared + 1
    };
  }

  return nextRoomChoiceState({
    ...applied,
    activeEvent: null,
    depth: state.depth + 1,
    roomsCleared: state.roomsCleared + 1
  });
};

export const resolveRestChoice = (state: RunState, mode: 'heal' | 'buff'): RunState => {
  if (state.status !== 'rest') return state;

  const next = mode === 'heal'
    ? { ...state.player, hp: clamp(state.player.hp + 16, 0, state.player.maxHp) }
    : { ...state.player, armor: state.player.armor + 1 };

  return nextRoomChoiceState({
    ...state,
    player: next,
    depth: state.depth + 1,
    roomsCleared: state.roomsCleared + 1
  });
};

export const buyShopOffer = (state: RunState, offerId: string): RunState => {
  if (state.status !== 'shop') return state;
  const offer = state.shopOffers.find((item) => item.id === offerId);
  if (!offer || state.player.gold < offer.costGold) return state;

  return {
    ...state,
    player: {
      ...offer.apply(state.player),
      gold: state.player.gold - offer.costGold
    },
    shopOffers: state.shopOffers.filter((item) => item.id !== offerId)
  };
};

export const leaveRoom = (state: RunState): RunState => {
  if (state.status === 'shop' || state.status === 'rest') {
    return nextRoomChoiceState({
      ...state,
      depth: state.depth + 1,
      roomsCleared: state.roomsCleared + 1
    });
  }
  return state;
};

export const makeSummary = (state: RunState, recordDepth: number): RunSummary => ({
  depthReached: state.depth,
  roomsCleared: state.roomsCleared,
  enemiesDefeated: state.enemiesDefeated,
  bestCombo: state.player.bestCombo,
  totalSolved: state.player.solved,
  accuracy: state.player.solved === 0 ? 0 : state.player.correct / state.player.solved,
  recordDepth
});

export const finishRun = (state: RunState): RunState => ({
  ...state,
  status: 'game-over'
});

export const isRunOver = (state: RunState): boolean => state.player.hp <= 0 || state.status === 'game-over';

export const canAfford = (offer: ShopOffer, gold: number) => gold >= offer.costGold;
