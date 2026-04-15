import { useEffect, useMemo, useState } from 'react';
import type { FlowState, GameModeId, GeneratedTask, LeaderboardRecord, Operation, RunState, TaskAttempt, TaskKind } from '../domain/types';
import { modeRegistry, defaultModeId } from '../systems/ModeRegistry';
import { TaskFactory } from '../generators/TaskFactory';
import { DifficultyEngine } from '../systems/DifficultyEngine';
import { ScoreSystem } from '../systems/ScoreSystem';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import {
  addLeaderboardRecord,
  loadAchievements,
  loadDailyChallenge,
  loadLeaderboard,
  loadProgress,
  loadSessionHistory,
  loadStats,
  recordFinishedRun,
  scopedStorageKey,
  saveProgress
} from '../storage/localStorageRepo';
import { soundManager } from '../../sound/soundManager';
import { useSettingsStore } from '../../store/settingsStore';

import { createInitialMastery, tierByDifficultyScore } from '../config/adaptiveTemplates';

const initialFlow: FlowState = {
  difficultyScore: 20,
  currentTier: tierByDifficultyScore(20),
  avgAnswerTimeMs: 4200,
  accuracyRate: 0,
  correctStreak: 0,
  wrongStreak: 0,
  templateMastery: createInitialMastery()
};

export interface AttemptSnapshot {
  isCorrect: boolean;
  answerMs: number;
  difficultyScore: number;
  score: number;
}

const MAX_ATTEMPT_HISTORY = 24;
const LOCAL_PLAYER_NAME_KEY = 'mathflow.playerName';

const resolvePlayerName = () => localStorage.getItem(scopedStorageKey(LOCAL_PLAYER_NAME_KEY))?.trim() || 'Player';

const taskKindsForMode = (currentModeId: GameModeId, unlockedTaskKinds: TaskKind[]): TaskKind[] =>
  currentModeId === 'equations' ? ['equation'] : unlockedTaskKinds;

interface RunConfig {
  preferredOperations?: Operation[];
  durationMs?: number;
}

const allArithmeticOperations: Operation[] = ['+', '-', '*', '/'];

const resolveOperationsForMode = (currentModeId: GameModeId, config?: RunConfig): Operation[] | undefined => {
  if (currentModeId === 'equations') return undefined;
  if (currentModeId === 'allmix') return allArithmeticOperations;
  if (currentModeId === 'custom') {
    const deduped = (config?.preferredOperations ?? []).filter((operation, index, arr) => arr.indexOf(operation) === index);
    return deduped.length > 0 ? deduped : ['+'];
  }
  return undefined;
};

const notifyRunFinished = (score: number, accuracy: number) => {
  const { notificationsEnabled } = useSettingsStore.getState();
  if (!notificationsEnabled || typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    // eslint-disable-next-line no-new
    new Notification('Run завершён', {
      body: `Счёт: ${score}. Точность: ${Math.round(accuracy * 100)}%.`
    });
    return;
  }

  if (Notification.permission === 'default') {
    void Notification.requestPermission();
  }
};

const buildRunState = (modeId: GameModeId, config?: RunConfig): RunState => {
  const mode = modeRegistry.find((item) => item.id === modeId);
  const now = Date.now();
  const durationMs = config?.durationMs ?? mode?.initialDurationMs;
  return {
    modeId,
    score: 0,
    combo: 0,
    speedMultiplier: 1,
    correct: 0,
    incorrect: 0,
    answered: 0,
    bestCombo: 0,
    startedAt: now,
    endsAt: durationMs ? now + durationMs : undefined,
    remainingMs: durationMs,
    shieldCharges: 0,
    doublePointsLeft: 0
  };
};

export const useMathTrainer = (options?: { autoStart?: boolean }) => {
  const [modeId, setModeId] = useState<GameModeId>(defaultModeId as GameModeId);
  const [progress, setProgress] = useState(loadProgress());
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>(loadLeaderboard());
  const [stats, setStats] = useState(loadStats());
  const [sessions, setSessions] = useState(loadSessionHistory());
  const [achievements, setAchievements] = useState(loadAchievements());
  const [dailyChallenge, setDailyChallenge] = useState(loadDailyChallenge());
  const [run, setRun] = useState<RunState>(() => buildRunState(defaultModeId as GameModeId));
  const [flow, setFlow] = useState<FlowState>(initialFlow);
  const [task, setTask] = useState<GeneratedTask | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [runConfig, setRunConfig] = useState<RunConfig>({});
  const [lastFeedback, setLastFeedback] = useState<string>('Ready');
  const [isFinished, setIsFinished] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<AttemptSnapshot[]>([]);

  const taskFactory = useMemo(() => new TaskFactory(), []);
  const scoreSystem = useMemo(() => new ScoreSystem(), []);
  const progressionSystem = useMemo(() => new ProgressionSystem(), []);

  const activeMode = modeRegistry.find((item) => item.id === modeId) ?? modeRegistry[0];
  const difficultyEngine = useMemo(() => new DifficultyEngine(activeMode.adaptiveSmoothing), [activeMode.adaptiveSmoothing]);

  const spawnTask = (state: FlowState = flow, nextModeId: GameModeId = modeId, answered = run.answered, config: RunConfig = runConfig) => {
    const next = taskFactory.next(
      state,
      taskKindsForMode(nextModeId, progress.unlockedTaskKinds),
      nextModeId === 'equations' ? 'equation' : undefined,
      { roundIndex: answered, preferredOperations: resolveOperationsForMode(nextModeId, config) }
    );
    setTask(next);
    setStartedAt(Date.now());
  };

  const startRun = (nextModeId: GameModeId, manualDifficultyScore = initialFlow.difficultyScore, config: RunConfig = {}) => {
    taskFactory.resetSession();
    const clampedDifficultyScore = Math.min(100, Math.max(0, manualDifficultyScore));
    setModeId(nextModeId);
    setRunConfig(config);
    setRun(buildRunState(nextModeId, config));
    const seededFlow: FlowState = {
      ...initialFlow,
      difficultyScore: clampedDifficultyScore,
      currentTier: tierByDifficultyScore(clampedDifficultyScore),
      templateMastery: createInitialMastery()
    };
    setFlow(seededFlow);
    setIsFinished(false);
    setAttemptHistory([]);
    setLastFeedback('Flow started');
    const nextTask = taskFactory.next(
      seededFlow,
      taskKindsForMode(nextModeId, progress.unlockedTaskKinds),
      nextModeId === 'equations' ? 'equation' : undefined
      ,
      { roundIndex: 0, preferredOperations: resolveOperationsForMode(nextModeId, config) }
    );
    setTask(nextTask);
    setStartedAt(Date.now());
    soundManager.play('click');
  };

  const finishRun = (finalRun: RunState) => {
    const accuracy = finalRun.answered === 0 ? 0 : finalRun.correct / finalRun.answered;
    const updatedProgress = progressionSystem.applyRun(progress, finalRun.score, accuracy);
    if (updatedProgress.level > progress.level) {
      soundManager.play('levelUp');
    }
    setProgress(updatedProgress);
    saveProgress(updatedProgress);

    const record: LeaderboardRecord = {
      id: crypto.randomUUID(),
      playerName: resolvePlayerName(),
      score: finalRun.score,
      modeId: finalRun.modeId,
      accuracy,
      createdAt: new Date().toISOString(),
      levelReached: updatedProgress.level
    };
    setLeaderboard(addLeaderboardRecord(record));

    const outcome = recordFinishedRun({
      session: {
        playedAt: new Date().toISOString(),
        modeId: finalRun.modeId,
        score: finalRun.score,
        accuracy,
        avgAnswerMs: finalRun.answered > 0 ? Math.round((Date.now() - finalRun.startedAt) / finalRun.answered) : 0,
        durationMs: Date.now() - finalRun.startedAt,
        bestCombo: finalRun.bestCombo
      },
      progress: updatedProgress,
      answered: finalRun.answered,
      correct: finalRun.correct,
      incorrect: finalRun.incorrect
    });

    setStats(outcome.stats);
    setSessions(outcome.sessions);
    setAchievements(outcome.achievements);
    setDailyChallenge(outcome.daily);
    setIsFinished(true);
    notifyRunFinished(finalRun.score, accuracy);
  };

  const submitAnswer = (rawInput: string) => {
    if (!task || isFinished) return;

    const normalizedInput = rawInput.trim();
    if (!normalizedInput) return;

    const elapsed = Date.now() - startedAt;
    const numeric = Number(normalizedInput.replace(',', '.'));
    const isCorrect = Number.isFinite(numeric) && Math.abs(numeric - task.answer) < 0.01;

    const attempt: TaskAttempt = {
      taskId: task.id,
      isCorrect,
      answerMs: elapsed,
      inputValue: normalizedInput,
      expected: task.answer,
      difficultyRating: task.difficultyRating,
      templateId: task.templateId,
      tier: task.tier,
      expectedTimeMs: task.expectedTimeMs
    };

    taskFactory.recordAttempt(attempt);

    const nextFlow = difficultyEngine.update(flow, attempt);
    const scored = scoreSystem.scoreAttempt(nextFlow, attempt, run.combo);
    const hasDoublePoints = isCorrect && run.doublePointsLeft > 0;
    const taskBonusMultiplier = isCorrect && task.modifier === 'golden' ? 2.5 : 1;
    const blitzBonusMultiplier = isCorrect && task.modifier === 'blitz' && elapsed <= task.timeLimitMs ? 2 : 1;
    const activeMultiplier = hasDoublePoints ? 2 : 1;
    const effectiveScoreDelta = isCorrect
      ? Math.round(scored.scoreDelta * taskBonusMultiplier * blitzBonusMultiplier * activeMultiplier)
      : scored.scoreDelta;
    const shieldProtectedMiss = !isCorrect && run.shieldCharges > 0;
    const nextCombo = shieldProtectedMiss ? run.combo : scored.nextCombo;

    const nextRun: RunState = {
      ...run,
      score: Math.max(0, run.score + effectiveScoreDelta),
      combo: nextCombo,
      speedMultiplier: scored.speedMultiplier,
      answered: run.answered + 1,
      correct: run.correct + (isCorrect ? 1 : 0),
      incorrect: run.incorrect + (isCorrect ? 0 : 1),
      bestCombo: Math.max(run.bestCombo, nextCombo),
      shieldCharges: isCorrect
        ? run.shieldCharges + (task.modifier === 'shield' ? 1 : 0)
        : Math.max(0, run.shieldCharges - (shieldProtectedMiss ? 1 : 0)),
      doublePointsLeft: isCorrect
        ? task.modifier === 'double3'
          ? 3
          : Math.max(0, run.doublePointsLeft - (hasDoublePoints ? 1 : 0))
        : run.doublePointsLeft
    };
    setAttemptHistory((prev) => [
      ...prev.slice(-(MAX_ATTEMPT_HISTORY - 1)),
      { isCorrect, answerMs: elapsed, difficultyScore: nextFlow.difficultyScore, score: nextRun.score }
    ]);

    const mode = modeRegistry.find((item) => item.id === run.modeId);
    if (mode?.failEndsRun && !isCorrect && !shieldProtectedMiss) {
      setRun(nextRun);
      setFlow(nextFlow);
      setLastFeedback(`❌ Mistake. Correct answer: ${task.answer}`);
      soundManager.play('chestOpen');
      finishRun(nextRun);
      return;
    }

    if (mode?.targetTasks && nextRun.answered >= mode.targetTasks) {
      setRun(nextRun);
      setFlow(nextFlow);
      setLastFeedback(isCorrect ? '✅ Finished target tasks!' : `⚠️ Correct answer: ${task.answer}`);
      soundManager.play(isCorrect ? 'reward' : 'click');
      finishRun(nextRun);
      return;
    }

    setRun(nextRun);
    setFlow(nextFlow);
    const modifierFeedback = isCorrect && task.modifier !== 'normal' ? ` [${task.modifierLabel}]` : '';
    const shieldFeedback = shieldProtectedMiss ? ' (shield saved combo)' : '';
    setLastFeedback(
      isCorrect
        ? `✅ +${effectiveScoreDelta} combo x${nextRun.combo}${modifierFeedback}`
        : `⚠️ ${task.answer}${shieldFeedback}`
    );
    soundManager.play(isCorrect ? 'reward' : 'click');
    spawnTask(nextFlow, run.modeId, nextRun.answered, runConfig);
  };

  useEffect(() => {
    if (options?.autoStart === false) return;
    startRun(defaultModeId as GameModeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.autoStart]);

  useEffect(() => {
    if (isFinished || !run.endsAt) return;

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, run.endsAt! - Date.now());
      setRun((prev) => ({ ...prev, remainingMs: remaining }));
      if (remaining <= 0) {
        window.clearInterval(timer);
        finishRun({ ...run, remainingMs: 0 });
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, [isFinished, run]);

  return {
    modeId,
    activeMode,
    run,
    flow,
    task,
    progress,
    leaderboard,
    attemptHistory,
    isFinished,
    lastFeedback,
    availableModes: modeRegistry.filter((mode) => progress.unlockedModes.includes(mode.id)),
    stats,
    sessions,
    achievements,
    dailyChallenge,
    startRun,
    submitAnswer,
    runConfig
  };
};
