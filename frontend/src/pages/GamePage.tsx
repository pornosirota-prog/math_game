import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';
import { modeRegistry } from '../mathgame/systems/ModeRegistry';

const percent = (value: number) => `${Math.round(value * 100)}%`;

export const GamePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedMode = searchParams.get('mode');
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
    startRun,
    submitAnswer,
    activeMode
  } = useMathTrainer();

  const [input, setInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (
      selectedMode &&
      modeId !== selectedMode &&
      modeRegistry.some((mode) => mode.id === selectedMode)
    ) {
      startRun(selectedMode as typeof modeId);
    }
  }, [selectedMode, startRun, modeId]);

  if (!selectedMode) return <Navigate to="/modes" replace />;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isPaused) return;
    submitAnswer(input);
    setInput('');
  };

  const goToResults = () => navigate('/results', {
    state: {
      score: run.score,
      accuracy: run.answered === 0 ? 0 : Math.round((run.correct / run.answered) * 100),
      bestCombo: run.bestCombo,
      answered: run.answered,
      mode: activeMode.title
    }
  });

  return (
    <div className="layout math-layout trainer-game">
      <section className="trainer-progress-wrap">
        <div className="trainer-progress">
          <div style={{ width: percent(flow.accuracyRate) }} />
        </div>
      </section>
      {!isFinished && task && (
        <div className="trainer-problem-wrap">
          <div className="prompt">{task.prompt}</div>
          <form onSubmit={onSubmit} className="answer-form">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isPaused ? 'Игра на паузе' : 'Введите ответ и нажмите Enter'}
              disabled={isPaused}
            />
            <button type="submit" disabled={isPaused}>✓</button>
          </form>
          <div className="trainer-qmark">?</div>
          <div className="feedback">{isPaused ? 'Пауза' : lastFeedback || '\u00A0'}</div>
          <div className="row trainer-control-row">
            <button type="button" onClick={() => setIsPaused((prev) => !prev)}>{isPaused ? 'Продолжить' : 'Пауза'}</button>
            <button type="button" onClick={goToResults}>Завершить игру</button>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="card result-card">
          <h3>Run Complete</h3>
          <p>Score: {run.score}</p>
          <p>Correct: {run.correct} / {run.answered}</p>
          <p>Best combo: x{run.bestCombo}</p>
          <div className="row">
            <button onClick={() => startRun(modeId)} type="button">Play Again</button>
            <button onClick={goToResults} type="button">К результатам</button>
          </div>
        </div>
      )}

      <div className="card stats-overview-grid trainer-stats">
        <div className="stat-pill"><span>Уровень</span><strong>{progress.level}</strong></div>
        <div className="stat-pill"><span>Лучший счёт</span><strong>{progress.bestScore}</strong></div>
        <div className="stat-pill"><span>Попыток</span><strong>{attemptHistory.length}</strong></div>
        <div className="stat-pill"><span>Запусков</span><strong>{progress.totalRuns}</strong></div>
      </div>

      <div className="card trainer-board">
        <h3>Client Leaderboard</h3>
        <ol>
          {leaderboard.slice(0, 8).map((entry) => (
            <li key={entry.id}>{entry.score} — {entry.modeId} — {Math.round(entry.accuracy * 100)}%</li>
          ))}
        </ol>
      </div>
    </div>
  );
};
