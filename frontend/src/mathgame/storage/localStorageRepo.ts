import type { GameModeId, LeaderboardRecord, PlayerMetaProgress } from '../domain/types';
import { defaultProgress } from '../systems/ProgressionSystem';

const PROGRESS_KEY = 'mathflow.progress.v1';
const LEADERBOARD_KEY = 'mathflow.leaderboard.v1';
const STATS_KEY = 'mathflow.stats.v1';
const SESSIONS_KEY = 'mathflow.sessions.v1';
const DAILY_CHALLENGE_KEY = 'mathflow.daily.v1';
const TOKEN_KEY = 'token';
const LAST_SCOPE_KEY = 'mathflow.scope.v1';

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

const normalizeScope = (scopeCandidate: unknown): string | null => {
  if (typeof scopeCandidate !== 'string') return null;
  const normalized = scopeCandidate.trim().toLowerCase();
  if (!normalized) return null;
  return normalized.replace(/[^a-z0-9._@-]/g, '_');
};

const getScopedKey = (key: string, scope: string) => `${key}:${scope}`;

const migrateGuestDataToScope = (scope: string) => {
  if (scope === 'guest') return;

  const keysToMigrate = [PROGRESS_KEY, STATS_KEY, SESSIONS_KEY, DAILY_CHALLENGE_KEY];
  keysToMigrate.forEach((key) => {
    const scopeKey = getScopedKey(key, scope);
    if (localStorage.getItem(scopeKey)) return;
    const guestValue = localStorage.getItem(getScopedKey(key, 'guest'));
    if (guestValue) {
      localStorage.setItem(scopeKey, guestValue);
    }
  });
};

const resolveStorageScope = (): string => {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
    if (token) {
      const payloadPart = token.split('.')[1];
      if (payloadPart) {
        const payload = JSON.parse(decodeBase64Url(payloadPart)) as Record<string, unknown>;
        const resolved = normalizeScope(payload.sub ?? payload.email ?? payload.userId);
        if (resolved) {
          migrateGuestDataToScope(resolved);
          localStorage.setItem(LAST_SCOPE_KEY, resolved);
          return resolved;
        }
      }
    }
  } catch {
    // ignore and fallback to remembered scope below
  }

  return localStorage.getItem(LAST_SCOPE_KEY) ?? 'guest';
};

export const scopedStorageKey = (key: string) => getScopedKey(key, resolveStorageScope());

export interface GameSessionRecord {
  id: string;
  playedAt: string;
  modeId: GameModeId;
  score: number;
  accuracy: number;
  avgAnswerMs: number;
  durationMs: number;
  bestCombo: number;
  isRecord: boolean;
}

export interface ModeStats {
  played: number;
  bestScore: number;
  avgAccuracy: number;
}

export interface PlayerStats {
  totalGames: number;
  totalCorrect: number;
  totalIncorrect: number;
  averageAccuracy: number;
  averageAnswerMs: number;
  bestStreak: number;
  bestScore: number;
  byMode: Partial<Record<GameModeId, ModeStats>>;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyChallengeState {
  challengeDate: string;
  modeId: GameModeId;
  targetScore: number;
  rewardXp: number;
  completed: boolean;
  completedAt?: string;
  progressScore: number;
}

const DEFAULT_STATS: PlayerStats = {
  totalGames: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  averageAccuracy: 0,
  averageAnswerMs: 0,
  bestStreak: 0,
  bestScore: 0,
  byMode: {}
};

const formatChallengeDate = (date = new Date()) => date.toISOString().slice(0, 10);

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(scopedStorageKey(key));
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
};

export const loadProgress = (): PlayerMetaProgress => {
  try {
    const raw = localStorage.getItem(scopedStorageKey(PROGRESS_KEY));
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return defaultProgress;
  }
};

export const saveProgress = (progress: PlayerMetaProgress) => {
  localStorage.setItem(scopedStorageKey(PROGRESS_KEY), JSON.stringify(progress));
};

export const loadLeaderboard = (): LeaderboardRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export const addLeaderboardRecord = (record: LeaderboardRecord): LeaderboardRecord[] => {
  const next = [record, ...loadLeaderboard()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
  return next;
};

export const loadStats = (): PlayerStats => readJson(STATS_KEY, DEFAULT_STATS);

export const saveStats = (stats: PlayerStats) => {
  localStorage.setItem(scopedStorageKey(STATS_KEY), JSON.stringify(stats));
};

export const loadSessionHistory = (): GameSessionRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(scopedStorageKey(SESSIONS_KEY)) ?? '[]');
  } catch {
    return [];
  }
};

const buildAchievements = (stats: PlayerStats, progress: PlayerMetaProgress): AchievementDefinition[] => {
  const now = new Date().toISOString();
  const achievements = [
    {
      id: 'first-steps',
      title: 'Первые шаги',
      description: 'Сыграйте 10 игр',
      unlocked: stats.totalGames >= 10
    },
    {
      id: 'accuracy-100',
      title: 'Точный расчёт',
      description: 'Достигните средней точности 90%',
      unlocked: stats.averageAccuracy >= 0.9
    },
    {
      id: 'combo-10',
      title: 'Без ошибок',
      description: 'Соберите стрик x10',
      unlocked: stats.bestStreak >= 10
    },
    {
      id: 'answers-100',
      title: 'Сотня ответов',
      description: 'Дайте 100 правильных ответов',
      unlocked: stats.totalCorrect >= 100
    },
    {
      id: 'level-up',
      title: 'Новый ранг',
      description: 'Достигните 5 уровня',
      unlocked: progress.level >= 5
    },
    {
      id: 'mode-unlock',
      title: 'Открытие режима',
      description: 'Откройте 4 режима',
      unlocked: progress.unlockedModes.length >= 4
    }
  ];

  return achievements.map((item) => (item.unlocked ? { ...item, unlockedAt: now } : item));
};

export const recordFinishedRun = (params: {
  session: Omit<GameSessionRecord, 'id' | 'isRecord'>;
  progress: PlayerMetaProgress;
  answered: number;
  correct: number;
  incorrect: number;
}): { stats: PlayerStats; sessions: GameSessionRecord[]; achievements: AchievementDefinition[]; daily: DailyChallengeState } => {
  const sessions = loadSessionHistory();
  const isRecord = params.session.score > (sessions[0]?.score ?? 0);
  const nextSession: GameSessionRecord = {
    ...params.session,
    id: crypto.randomUUID(),
    isRecord
  };

  const nextSessions = [nextSession, ...sessions].slice(0, 30);
  localStorage.setItem(scopedStorageKey(SESSIONS_KEY), JSON.stringify(nextSessions));

  const previous = loadStats();
  const totalGames = previous.totalGames + 1;
  const totalCorrect = previous.totalCorrect + params.correct;
  const totalIncorrect = previous.totalIncorrect + params.incorrect;
  const averageAccuracy = ((previous.averageAccuracy * previous.totalGames) + params.session.accuracy) / totalGames;
  const averageAnswerMs = ((previous.averageAnswerMs * previous.totalGames) + params.session.avgAnswerMs) / totalGames;

  const prevMode = previous.byMode[params.session.modeId] ?? {
    played: 0,
    bestScore: 0,
    avgAccuracy: 0
  };
  const modePlayed = prevMode.played + 1;
  const byMode: PlayerStats['byMode'] = {
    ...previous.byMode,
    [params.session.modeId]: {
      played: modePlayed,
      bestScore: Math.max(prevMode.bestScore, params.session.score),
      avgAccuracy: ((prevMode.avgAccuracy * prevMode.played) + params.session.accuracy) / modePlayed
    }
  };

  const stats: PlayerStats = {
    totalGames,
    totalCorrect,
    totalIncorrect,
    averageAccuracy,
    averageAnswerMs,
    bestStreak: Math.max(previous.bestStreak, params.session.bestCombo),
    bestScore: Math.max(previous.bestScore, params.session.score),
    byMode
  };

  saveStats(stats);
  const achievements = buildAchievements(stats, params.progress);

  const daily = loadDailyChallenge();
  const isTodayChallenge = daily.challengeDate === formatChallengeDate();
  const canAdvance = isTodayChallenge && !daily.completed && daily.modeId === params.session.modeId;
  const nextProgressScore = canAdvance ? Math.max(daily.progressScore, params.session.score) : daily.progressScore;
  const completed = canAdvance ? nextProgressScore >= daily.targetScore : daily.completed;
  const nextDaily: DailyChallengeState = {
    ...daily,
    progressScore: nextProgressScore,
    completed,
    completedAt: completed ? (daily.completedAt ?? new Date().toISOString()) : undefined
  };
  localStorage.setItem(scopedStorageKey(DAILY_CHALLENGE_KEY), JSON.stringify(nextDaily));

  return { stats, sessions: nextSessions, achievements, daily: nextDaily };
};

export const loadDailyChallenge = (): DailyChallengeState => {
  const today = formatChallengeDate();
  const fallback: DailyChallengeState = {
    challengeDate: today,
    modeId: 'classic',
    targetScore: 700,
    rewardXp: 120,
    completed: false,
    progressScore: 0
  };

  try {
    const raw = localStorage.getItem(scopedStorageKey(DAILY_CHALLENGE_KEY));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as DailyChallengeState;
    if (parsed.challengeDate === today) return parsed;

    const seededModeOrder: GameModeId[] = ['classic', 'sprint60', 'allmix', 'twenty', 'streak', 'infinite', 'custom'];
    const day = Number.parseInt(today.split('-')[2] ?? '1', 10);
    const modeId = seededModeOrder[day % seededModeOrder.length];
    const nextChallenge: DailyChallengeState = {
      ...fallback,
      modeId,
      targetScore: 500 + day * 10
    };
    localStorage.setItem(scopedStorageKey(DAILY_CHALLENGE_KEY), JSON.stringify(nextChallenge));
    return nextChallenge;
  } catch {
    return fallback;
  }
};

export const loadAchievements = (): AchievementDefinition[] => {
  const stats = loadStats();
  const progress = loadProgress();
  return buildAchievements(stats, progress);
};
