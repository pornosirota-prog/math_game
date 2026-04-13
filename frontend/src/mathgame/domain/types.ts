export type Operation = '+' | '-' | '*' | '/';

export type TaskKind = 'arithmetic' | 'equation';

export type TemplateId =
  | 'tier1_two_single_add'
  | 'tier2_single_plus_double'
  | 'tier3_two_double_no_carry'
  | 'tier4_two_double_with_carry'
  | 'tier5_two_triple_light'
  | 'tier6_two_triple_carry'
  | 'tier7_three_double_add'
  | 'tier8_two_double_one_triple'
  | 'tier9_three_triple_add'
  | 'tier10_mixed_ops';

export interface NumberSpec {
  min: number;
  max: number;
}

export interface DifficultyTemplate {
  id: TemplateId;
  tier: number;
  label: string;
  taskKind: TaskKind;
  operations: Operation[];
  numberSpecs: NumberSpec[];
  expectedTimeMs: number;
  allowNegativeResult: boolean;
  requiresCarry?: boolean;
  challengeWeight?: number;
}

export interface GeneratedTask {
  id: string;
  kind: TaskKind;
  prompt: string;
  answer: number;
  difficultyRating: number;
  timeLimitMs: number;
  templateId: TemplateId;
  tier: number;
  expectedTimeMs: number;
}

export interface TaskAttempt {
  taskId: string;
  isCorrect: boolean;
  answerMs: number;
  inputValue: string;
  expected: number;
  difficultyRating: number;
  templateId: TemplateId;
  tier: number;
  expectedTimeMs: number;
}

export type GameModeId = 'classic' | 'infinite' | 'streak' | 'sprint60' | 'twenty';

export interface GameMode {
  id: GameModeId;
  title: string;
  description: string;
  initialDurationMs?: number;
  targetTasks?: number;
  failEndsRun?: boolean;
  adaptiveSmoothing: number;
}

export type TemplateMasteryMap = Record<TemplateId, number>;

export interface FlowState {
  difficultyScore: number;
  currentTier: number;
  avgAnswerTimeMs: number;
  accuracyRate: number;
  correctStreak: number;
  wrongStreak: number;
  templateMastery: TemplateMasteryMap;
}

export interface RunState {
  modeId: GameModeId;
  score: number;
  combo: number;
  speedMultiplier: number;
  correct: number;
  incorrect: number;
  answered: number;
  bestCombo: number;
  startedAt: number;
  endsAt?: number;
  remainingMs?: number;
}

export interface PlayerMetaProgress {
  level: number;
  xp: number;
  totalRuns: number;
  bestScore: number;
  unlockedModes: GameModeId[];
  unlockedTaskKinds: TaskKind[];
  achievements: string[];
  dailyChallengeStreak: number;
  lastPlayedDate?: string;
}

export interface LeaderboardRecord {
  id: string;
  score: number;
  modeId: GameModeId;
  accuracy: number;
  createdAt: string;
  levelReached: number;
}
