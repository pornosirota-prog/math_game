import { FormEvent, useState } from 'react';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';

const percent = (value: number) => `${Math.round(value * 100)}%`;
const clampPercent = (value: number) => `${Math.max(4, Math.min(100, Math.round(value)))}%`;

const presets = [
  { id: 'easy', label: 'Легко', skill: 2 },
  { id: 'normal', label: 'Нормально', skill: 4.5 },
  { id: 'hard', label: 'Сложно', skill: 7.5 }
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
  const accuracyByHistory = attemptHistory.length
    ? attemptHistory.filter((item) => item.isCorrect).length / attemptHistory.length
    : 0;
  const maxScoreInHistory = Math.max(...attemptHistory.map((item) => item.score), 1);

  return (
    <div className="layout math-layout">
      <div className="card">
        <h2>Math Flow Arena</h2>
        <p>Adaptive speed math trainer with progression and combo meta.</p>
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
                  startRun(modeId, preset.skill);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card hud-grid">
        <div><strong>Score:</strong> {run.score}</div>
        <div><strong>Combo:</strong> x{run.combo}</div>
        <div><strong>Speed:</strong> x{run.speedMultiplier.toFixed(2)}</div>
        <div><strong>Flow:</strong> {Math.round(flow.flow)}</div>
        <div><strong>Difficulty:</strong> {flow.skill.toFixed(1)}</div>
        <div><strong>Accuracy:</strong> {percent(flow.accuracy)}</div>
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
              placeholder="Type answer and hit Enter"
            />
            <button type="submit">Answer</button>
          </form>
          <div className="feedback">{lastFeedback}</div>
        </div>
      )}

      {isFinished && (
        <div className="card">
          <h3>Run Complete</h3>
          <p>Score: {run.score}</p>
          <p>Correct: {run.correct} / {run.answered}</p>
          <p>Best combo: x{run.bestCombo}</p>
          <button onClick={() => startRun(modeId)} type="button">Play Again</button>
        </div>
      )}

      <div className="card">
        <h3>Визуальная статистика</h3>
        <div className="stats-mini-grid">
          <div>Точность: <strong>{percent(accuracyByHistory)}</strong></div>
          <div>Ср. реакция: <strong>{avgReaction || 0} ms</strong></div>
        </div>
        <div className="chart">
          {attemptHistory.length === 0 && <p className="empty-chart">Решите несколько примеров, и графики появятся здесь.</p>}
          {attemptHistory.map((item, index) => (
            <div key={`${item.score}-${index}`} className="bar-column" title={`#${index + 1}`}>
              <div
                className={`bar accuracy ${item.isCorrect ? 'good' : 'bad'}`}
                style={{ height: clampPercent(item.isCorrect ? 100 : 20) }}
              />
              <div
                className="bar score"
                style={{ height: clampPercent((item.score / maxScoreInHistory) * 100) }}
              />
              <div
                className="bar skill"
                style={{ height: clampPercent((item.skill / 10) * 100) }}
              />
            </div>
          ))}
        </div>
        <small className="chart-legend">
          <span className="dot good" /> Точность
          <span className="dot score" /> Счёт
          <span className="dot skill" /> Сложность
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
