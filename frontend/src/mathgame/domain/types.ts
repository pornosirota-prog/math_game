export type Operation = '+' | '-' | '*' | '/';

export type TaskKind = 'arithmetic' | 'equation';

export interface DifficultyBand {
  minSkill: number;
  maxSkill: number;
  numberRange: [number, number];
  termCount: [number, number];
  operations: Operation[];
  allowNegativeNumbers: boolean;
  allowParentheses: boolean;
  allowsUnknowns: boolean;
  taskKinds: TaskKind[];
  answerTimeLimitMs: number;
  challengeChance: number;
}

export interface GeneratedTask {
  id: string;
  kind: TaskKind;
  prompt: string;
  answer: number;
  difficultyRating: number;
  timeLimitMs: number;
}

export interface TaskAttempt {
  taskId: string;
  isCorrect: boolean;
  answerMs: number;
  inputValue: string;
  expected: number;
  difficultyRating: number;
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

export interface FlowState {
  skill: number;
  flow: number;
  avgAnswerMs: number;
  accuracy: number;
  correctStreak: number;
  errorStreak: number;
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
