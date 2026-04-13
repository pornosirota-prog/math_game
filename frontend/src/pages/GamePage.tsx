import { FormEvent, useState } from 'react';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';

const percent = (value: number) => `${Math.round(value * 100)}%`;

export const GamePage = () => {
  const {
    task,
    run,
    flow,
    progress,
    leaderboard,
    isFinished,
    lastFeedback,
    modeId,
    availableModes,
    startRun,
    submitAnswer,
    activeMode
  } = useMathTrainer();

  const [input, setInput] = useState('');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitAnswer(input);
    setInput('');
  };

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
