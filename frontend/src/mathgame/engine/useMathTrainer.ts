import { useEffect, useMemo, useState } from 'react';
import type { FlowState, GameModeId, GeneratedTask, LeaderboardRecord, RunState, TaskAttempt } from '../domain/types';
import { modeRegistry, defaultModeId } from '../systems/ModeRegistry';
import { TaskFactory } from '../generators/TaskFactory';
import { DifficultyAdapter } from '../systems/DifficultyAdapter';
import { ScoreSystem } from '../systems/ScoreSystem';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { addLeaderboardRecord, loadLeaderboard, loadProgress, saveProgress } from '../storage/localStorageRepo';
import { soundManager } from '../../sound/soundManager';

const initialFlow: FlowState = {
  skill: 1,
  flow: 30,
  avgAnswerMs: 4200,
  accuracy: 0,
  correctStreak: 0,
  errorStreak: 0
};

export interface AttemptSnapshot {
  isCorrect: boolean;
  answerMs: number;
  skill: number;
  score: number;
}

const MAX_ATTEMPT_HISTORY = 24;

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
    remainingMs: mode?.initialDurationMs
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
  const difficultyAdapter = useMemo(() => new DifficultyAdapter(activeMode.adaptiveSmoothing), [activeMode.adaptiveSmoothing]);

  const spawnTask = () => {
    const next = taskFactory.next(flow.skill, progress.unlockedTaskKinds);
    setTask(next);
    setStartedAt(Date.now());
  };

  const startRun = (nextModeId: GameModeId, manualSkill = initialFlow.skill) => {
    const clampedSkill = Math.min(10, Math.max(1, manualSkill));
    setModeId(nextModeId);
    setRun(buildRunState(nextModeId));
    setFlow({ ...initialFlow, skill: clampedSkill });
    setIsFinished(false);
    setAttemptHistory([]);
    setLastFeedback('Flow started');
    const nextTask = taskFactory.next(clampedSkill, progress.unlockedTaskKinds);
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
      difficultyRating: task.difficultyRating
    };

    const nextFlow = difficultyAdapter.update(flow, attempt);
    const scored = scoreSystem.scoreAttempt(nextFlow, attempt, run.combo);

    const nextRun: RunState = {
      ...run,
      score: Math.max(0, run.score + scored.scoreDelta),
      combo: scored.nextCombo,
      speedMultiplier: scored.speedMultiplier,
      answered: run.answered + 1,
      correct: run.correct + (isCorrect ? 1 : 0),
      incorrect: run.incorrect + (isCorrect ? 0 : 1),
      bestCombo: Math.max(run.bestCombo, scored.nextCombo)
    };
    setAttemptHistory((prev) => [
      ...prev.slice(-(MAX_ATTEMPT_HISTORY - 1)),
      { isCorrect, answerMs: elapsed, skill: nextFlow.skill, score: nextRun.score }
    ]);

    const mode = modeRegistry.find((item) => item.id === run.modeId);
    if (mode?.failEndsRun && !isCorrect) {
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
    setLastFeedback(isCorrect ? `✅ +${scored.scoreDelta} combo x${nextRun.combo}` : `⚠️ ${task.answer}`);
    soundManager.play(isCorrect ? 'reward' : 'click');
    spawnTask();
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
