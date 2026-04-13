import { FormEvent, useState } from 'react';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';

const percent = (value: number) => `${Math.round(value * 100)}%`;
const clampPercent = (value: number) => `${Math.max(4, Math.min(100, Math.round(value)))}%`;
const safeDivide = (value: number, divider: number) => (divider === 0 ? 0 : value / divider);

const presets = [
  { id: 'easy', label: 'Легко', score: 15 },
  { id: 'normal', label: 'Нормально', score: 35 },
  { id: 'hard', label: 'Сложно', score: 60 }
] as const;

export const GamePage = () => {
  const {
    task,
    run,
    flow,
    progress,
    leaderboard,
    attemptHistory,
    isFinished,
    lastFeedback,
    modeId,
    availableModes,
    startRun,
    submitAnswer,
    activeMode
  } = useMathTrainer();

  const [input, setInput] = useState('');
  const [difficultyPreset, setDifficultyPreset] = useState<typeof presets[number]['id']>('normal');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitAnswer(input);
    setInput('');
  };

  const avgReaction = attemptHistory.length
    ? Math.round(attemptHistory.reduce((sum, item) => sum + item.answerMs, 0) / attemptHistory.length)
    : 0;
  const bestReaction = attemptHistory.length
    ? Math.min(...attemptHistory.map((item) => item.answerMs))
    : 0;
  const accuracyByHistory = attemptHistory.length
    ? attemptHistory.filter((item) => item.isCorrect).length / attemptHistory.length
    : 0;
  const recentAttempts = attemptHistory.slice(-10);
  const recentAccuracy = recentAttempts.length
    ? recentAttempts.filter((item) => item.isCorrect).length / recentAttempts.length
    : 0;

  const scoreDeltas = attemptHistory.map((item, index) =>
    index === 0 ? item.score : item.score - attemptHistory[index - 1].score
  );
  const avgScoreDelta = scoreDeltas.length
    ? Math.round(scoreDeltas.reduce((sum, delta) => sum + delta, 0) / scoreDeltas.length)
    : 0;
  const maxAnswerMs = Math.max(...attemptHistory.map((item) => item.answerMs), 1);
  const minScoreDelta = Math.min(...scoreDeltas, 0);
  const maxScoreDelta = Math.max(...scoreDeltas, 1);
  const scoreDeltaRange = Math.max(1, maxScoreDelta - minScoreDelta);

  return (
    <div className="layout math-layout">
      <section className="hero-panel card">
        <div>
          <p className="hero-kicker">Modern Arcade Math</p>
          <h2>Math Flow Arena</h2>
          <p className="hero-subtitle">Премиальный speed-trainer с комбо, прогрессом и живой визуальной динамикой.</p>
        </div>
        <div className="hero-glass-preview">
          <div className="preview-label">Live HUD</div>
          <div className="preview-main">{task?.prompt ?? '128 + 47 = ?'}</div>
          <div className="preview-meta">
            <span>Combo x{run.combo}</span>
            <span>{typeof run.remainingMs === 'number' ? `${(run.remainingMs / 1000).toFixed(1)}s` : '∞ time'}</span>
          </div>
        </div>
      </section>

      <div className="card mode-card">
        <div className="row mode-row">
          {availableModes.map((mode) => (
            <button
              key={mode.id}
              className={modeId === mode.id ? 'active-mode' : ''}
              onClick={() => startRun(mode.id)}
              type="button"
            >
              {mode.title}
            </button>
          ))}
        </div>
        <small>{activeMode.description}</small>
        <div className="difficulty-controls">
          <span>Стартовая сложность:</span>
          <div className="row">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={difficultyPreset === preset.id ? 'active-preset' : ''}
                onClick={() => {
                  setDifficultyPreset(preset.id);
                  startRun(modeId, preset.score);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card hud-grid neon-grid">
        <div><strong>Score:</strong> {run.score}</div>
        <div><strong>Combo:</strong> x{run.combo}</div>
        <div><strong>Speed:</strong> x{run.speedMultiplier.toFixed(2)}</div>
        <div><strong>Tier:</strong> {flow.currentTier}</div>
        <div><strong>Difficulty:</strong> {Math.round(flow.difficultyScore)}</div>
        <div><strong>Accuracy:</strong> {percent(flow.accuracyRate)}</div>
        {typeof run.remainingMs === 'number' && <div><strong>Time:</strong> {(run.remainingMs / 1000).toFixed(1)}s</div>}
      </div>

      {!isFinished && task && (
        <div className="card arena-card">
          <div className="prompt">{task.prompt}</div>
          <form onSubmit={onSubmit} className="answer-form">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введите ответ и нажмите Enter"
            />
            <button type="submit">Ответить</button>
          </form>
          <div className="feedback">{lastFeedback}</div>
        </div>
      )}

      {isFinished && (
        <div className="card result-card">
          <h3>Run Complete</h3>
          <p>Score: {run.score}</p>
          <p>Correct: {run.correct} / {run.answered}</p>
          <p>Best combo: x{run.bestCombo}</p>
          <button onClick={() => startRun(modeId)} type="button">Play Again</button>
        </div>
      )}

      <div className="card">
        <h3>Визуальная статистика</h3>
        <div className="stats-overview-grid">
          <div className="stat-pill">
            <span>Попыток</span>
            <strong>{attemptHistory.length}</strong>
          </div>
          <div className="stat-pill">
            <span>Общая точность</span>
            <strong>{percent(accuracyByHistory)}</strong>
          </div>
          <div className="stat-pill">
            <span>Точность (последние 10)</span>
            <strong>{percent(recentAccuracy)}</strong>
          </div>
          <div className="stat-pill">
            <span>Ср. реакция</span>
            <strong>{avgReaction || 0} ms</strong>
          </div>
          <div className="stat-pill">
            <span>Лучшая реакция</span>
            <strong>{bestReaction || 0} ms</strong>
          </div>
          <div className="stat-pill">
            <span>Ср. прирост очков</span>
            <strong>{avgScoreDelta}</strong>
          </div>
        </div>
        <div className="smart-chart">
          {attemptHistory.length === 0 && <p className="empty-chart">Решите несколько примеров, и графики появятся здесь.</p>}
          {attemptHistory.length > 0 && (
            <>
              <div className="metric-row">
                <div className="metric-label">Скорость реакции</div>
                <div className="metric-track">
                  {attemptHistory.map((item, index) => (
                    <div
                      key={`reaction-${index}`}
                      className="metric-bar reaction"
                      style={{ height: clampPercent(safeDivide(maxAnswerMs - item.answerMs, maxAnswerMs) * 100) }}
                      title={`#${index + 1}: ${item.answerMs} ms`}
                    />
                  ))}
                </div>
              </div>
              <div className="metric-row">
                <div className="metric-label">Прирост очков</div>
                <div className="metric-track">
                  {scoreDeltas.map((delta, index) => (
                    <div
                      key={`delta-${index}`}
                      className={`metric-bar ${delta >= 0 ? 'score-up' : 'score-down'}`}
                      style={{ height: clampPercent(((delta - minScoreDelta) / scoreDeltaRange) * 100) }}
                      title={`#${index + 1}: ${delta >= 0 ? '+' : ''}${delta}`}
                    />
                  ))}
                </div>
              </div>
              <div className="metric-row">
                <div className="metric-label">Сложность</div>
                <div className="metric-track">
                  {attemptHistory.map((item, index) => (
                    <div
                      key={`skill-${index}`}
                      className="metric-bar skill"
                      style={{ height: clampPercent(item.difficultyScore) }}
                      title={`#${index + 1}: ${Math.round(item.difficultyScore)}`}
                    />
                  ))}
                </div>
              </div>
              <div className="attempt-timeline">
                {attemptHistory.map((item, index) => (
                  <span
                    key={`attempt-${index}`}
                    className={`attempt-dot ${item.isCorrect ? 'ok' : 'miss'}`}
                    title={`#${index + 1}: ${item.isCorrect ? 'верно' : 'ошибка'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <small className="chart-legend">
          <span className="dot reaction" /> Быстрее = выше
          <span className="dot score" /> Прирост очков
          <span className="dot skill" /> Сложность
          <span className="dot good" /> Верно
          <span className="dot bad" /> Ошибка
        </small>
      </div>

      <div className="card">
        <h3>Meta Progress</h3>
        <p>Level: {progress.level} | XP: {progress.xp}</p>
        <p>Best score: {progress.bestScore} | Runs: {progress.totalRuns}</p>
        <p>Achievements: {progress.achievements.length ? progress.achievements.join(', ') : 'none yet'}</p>
      </div>

      <div className="card">
        <h3>Client Leaderboard</h3>
        <ol>
          {leaderboard.slice(0, 8).map((entry) => (
            <li key={entry.id}>
              {entry.score} — {entry.modeId} — {Math.round(entry.accuracy * 100)}%
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
