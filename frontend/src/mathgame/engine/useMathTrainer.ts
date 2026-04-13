import { useEffect, useMemo, useState } from 'react';
import type { FlowState, GameModeId, GeneratedTask, LeaderboardRecord, RunState, TaskAttempt, TaskKind } from '../domain/types';
import { modeRegistry, defaultModeId } from '../systems/ModeRegistry';
import { TaskFactory } from '../generators/TaskFactory';
import { DifficultyEngine } from '../systems/DifficultyEngine';
import { ScoreSystem } from '../systems/ScoreSystem';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { addLeaderboardRecord, loadLeaderboard, loadProgress, saveProgress } from '../storage/localStorageRepo';
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
const taskKindsForMode = (currentModeId: GameModeId, unlockedTaskKinds: TaskKind[]): TaskKind[] =>
  currentModeId === 'equations' ? ['equation'] : unlockedTaskKinds;

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

const buildRunState = (modeId: GameModeId): RunState => {
  const mode = modeRegistry.find((item) => item.id === modeId);
  const now = Date.now();
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
    endsAt: mode?.initialDurationMs ? now + mode.initialDurationMs : undefined,
    remainingMs: mode?.initialDurationMs,
    shieldCharges: 0,
    doublePointsLeft: 0
  };
};

export const useMathTrainer = () => {
  const [modeId, setModeId] = useState<GameModeId>(defaultModeId as GameModeId);
  const [progress, setProgress] = useState(loadProgress());
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>(loadLeaderboard());
  const [run, setRun] = useState<RunState>(() => buildRunState(defaultModeId as GameModeId));
  const [flow, setFlow] = useState<FlowState>(initialFlow);
  const [task, setTask] = useState<GeneratedTask | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [lastFeedback, setLastFeedback] = useState<string>('Ready');
  const [isFinished, setIsFinished] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<AttemptSnapshot[]>([]);

  const taskFactory = useMemo(() => new TaskFactory(), []);
  const scoreSystem = useMemo(() => new ScoreSystem(), []);
  const progressionSystem = useMemo(() => new ProgressionSystem(), []);

  const activeMode = modeRegistry.find((item) => item.id === modeId) ?? modeRegistry[0];
  const difficultyEngine = useMemo(() => new DifficultyEngine(activeMode.adaptiveSmoothing), [activeMode.adaptiveSmoothing]);

  const spawnTask = (state: FlowState = flow, nextModeId: GameModeId = modeId) => {
    const next = taskFactory.next(state, taskKindsForMode(nextModeId, progress.unlockedTaskKinds), nextModeId === 'equations' ? 'equation' : undefined);
    setTask(next);
    setStartedAt(Date.now());
  };

  const startRun = (nextModeId: GameModeId, manualDifficultyScore = initialFlow.difficultyScore) => {
    const clampedDifficultyScore = Math.min(100, Math.max(0, manualDifficultyScore));
    setModeId(nextModeId);
    setRun(buildRunState(nextModeId));
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
      score: finalRun.score,
      modeId: finalRun.modeId,
      accuracy,
      createdAt: new Date().toISOString(),
      levelReached: updatedProgress.level
    };
    setLeaderboard(addLeaderboardRecord(record));
    setIsFinished(true);
    notifyRunFinished(finalRun.score, accuracy);
  };

  const submitAnswer = (rawInput: string) => {
    if (!task || isFinished) return;

    const elapsed = Date.now() - startedAt;
    const numeric = Number(rawInput.replace(',', '.'));
    const isCorrect = Number.isFinite(numeric) && Math.abs(numeric - task.answer) < 0.01;

    const attempt: TaskAttempt = {
      taskId: task.id,
      isCorrect,
      answerMs: elapsed,
      inputValue: rawInput,
      expected: task.answer,
      difficultyRating: task.difficultyRating,
      templateId: task.templateId,
      tier: task.tier,
      expectedTimeMs: task.expectedTimeMs
    };

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
    spawnTask(nextFlow, run.modeId);
  };

  useEffect(() => {
    startRun(defaultModeId as GameModeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    startRun,
    submitAnswer
  };
};
