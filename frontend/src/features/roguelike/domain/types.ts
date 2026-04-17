export type RoomType = 'fight' | 'treasure' | 'event' | 'shop' | 'rest' | 'elite';
export type EnemyBehavior = 'normal' | 'aggressive' | 'defensive' | 'swift' | 'elite';
export type RelicRarity = 'common' | 'rare' | 'epic';

export interface MathTask {
  id: string;
  prompt: string;
  answer: number;
  timeLimitMs: number;
  tier: number;
}

export interface DifficultyBand {
  depth: number;
  operations: Array<'+' | '-' | '*' | '/'>;
  min: number;
  max: number;
  chained: boolean;
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  armor: number;
  gold: number;
  crystals: number;
  baseDamage: number;
  speedBonusMultiplier: number;
  combo: number;
  bestCombo: number;
  solved: number;
  correct: number;
  mistakesForgivenInBattle: boolean;
  relicIds: string[];
}

export interface EnemyDefinition {
  id: string;
  name: string;
  behavior: EnemyBehavior;
  rarity: 'normal' | 'elite';
  baseHp: number;
  baseDamage: number;
  attackEveryActions: number;
  speedPressureMs: number;
}

export interface EnemyInstance {
  id: string;
  defId: string;
  name: string;
  behavior: EnemyBehavior;
  rarity: 'normal' | 'elite';
  hp: number;
  maxHp: number;
  damage: number;
  attackEveryActions: number;
  speedPressureMs: number;
  actionsUntilAttack: number;
}

export interface RoomDefinition {
  id: string;
  type: RoomType;
  title: string;
  description: string;
  risk: number;
  rewardHint: string;
}

export interface RelicEffect {
  type: 'baseDamageFlat' | 'speedBonusPercent' | 'maxHpFlat' | 'extraGoldPercent' | 'healAfterVictory' | 'forgiveMistakeOnce';
  value: number;
}

export interface RelicDefinition {
  id: string;
  title: string;
  description: string;
  rarity: RelicRarity;
  effect: RelicEffect;
}

export interface Reward {
  gold: number;
  crystals: number;
  heal: number;
  relicChoices: RelicDefinition[];
  source: RoomType;
}

export interface ShopOffer {
  id: string;
  label: string;
  description: string;
  costGold: number;
  apply: (player: PlayerState) => PlayerState;
}

export interface EventOption {
  id: string;
  label: string;
  description: string;
  apply: (state: RunState) => RunState;
}

export interface EventDefinition {
  id: string;
  title: string;
  description: string;
  options: EventOption[];
}

export interface BattleState {
  enemy: EnemyInstance;
  currentTask: MathTask;
  startedAt: number;
  actionLog: string[];
}

export interface BattleTurnResult {
  isCorrect: boolean;
  damageToEnemy: number;
  damageToPlayer: number;
  answerTimeMs: number;
  nextTask: MathTask;
  logLine: string;
  victory: boolean;
  defeat: boolean;
}


export interface RunStepRecord {
  step: number;
  roomType: RoomType;
  depth: number;
  roomTitle: string;
  hpAfterRoom: number;
  rewardOrEvent?: string;
  enemyName?: string;
}

export interface RunAnswerRecord {
  step: number;
  depth: number;
  roomType: RoomType;
  prompt: string;
  isCorrect: boolean;
  timedOut: boolean;
}

export interface RunDeathSummary {
  reason: string;
  roomType: RoomType;
  depth: number;
  step: number;
}
export interface RunSummary {
  depthReached: number;
  durationMs: number;
  gold: number;
  crystals: number;
  deathReason: string;
  roomsCleared: number;
  enemiesDefeated: number;
  bestCombo: number;
  totalSolved: number;
  accuracy: number;
  recordDepth: number;
}

export interface RunState {
  status: 'room-choice' | 'battle' | 'reward' | 'event' | 'shop' | 'rest' | 'game-over';
  depth: number;
  roomsCleared: number;
  enemiesDefeated: number;
  player: PlayerState;
  roomChoices: RoomDefinition[];
  activeRoom: RoomDefinition | null;
  activeBattle: BattleState | null;
  pendingReward: Reward | null;
  activeEvent: EventDefinition | null;
  shopOffers: ShopOffer[];
  runLog: string[];
  summary: RunSummary | null;
  runStartedAt: number;
  runEndedAt: number | null;
  runSteps: RunStepRecord[];
  answerHistory: RunAnswerRecord[];
  death: RunDeathSummary | null;
}

export interface DifficultyStrategy {
  getBand: (depth: number) => DifficultyBand;
}

export interface MathTaskGenerator {
  generate: (band: DifficultyBand, now: number) => MathTask;
}

export interface RewardCalculator {
  calculateBattleReward: (params: {
    depth: number;
    roomType: RoomType;
    enemyRarity: 'normal' | 'elite';
    accuracy: number;
    combo: number;
    speedRate: number;
  }) => Reward;
}
