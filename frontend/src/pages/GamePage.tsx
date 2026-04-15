import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';
import { modeRegistry } from '../mathgame/systems/ModeRegistry';

const percent = (value: number) => `${Math.round(value * 100)}%`;
const timerLabel = (remainingMs?: number) => (remainingMs ? `${Math.ceil(remainingMs / 1000)}с` : '∞');

export const GamePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedMode = searchParams.get('mode');
  const {
    task,
    run,
    flow,
    isFinished,
    lastFeedback,
    modeId,
    startRun,
    submitAnswer,
    activeMode
  } = useMathTrainer({ autoStart: false });

  const [input, setInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isRoundStarted, setIsRoundStarted] = useState(false);

  useEffect(() => {
    if (!selectedMode || !modeRegistry.some((mode) => mode.id === selectedMode)) {
      return;
    }
    setIsRoundStarted(false);
    setInput('');
    setIsPaused(false);
  }, [selectedMode]);

  const modeIsValid = useMemo(
    () => Boolean(selectedMode && modeRegistry.some((mode) => mode.id === selectedMode)),
    [selectedMode]
  );

  if (!selectedMode || !modeIsValid) return <Navigate to="/modes" replace />;

  const beginRound = () => {
    startRun(selectedMode as typeof modeId);
    setIsRoundStarted(true);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isRoundStarted || isPaused) return;
    submitAnswer(input);
    setInput('');
  };

  const onInputChange = (value: string) => {
    setInput(value);
    if (isPaused || !task || !isRoundStarted) return;
    const numeric = Number(value.replace(',', '.'));
    const isCorrect = Number.isFinite(numeric) && Math.abs(numeric - task.answer) < 0.01;
    if (!isCorrect) return;
    submitAnswer(value);
    setInput('');
  };

  const goToResults = () => navigate('/results', {
    state: {
      score: run.score,
      accuracy: run.answered === 0 ? 0 : Math.round((run.correct / run.answered) * 100),
      bestCombo: run.bestCombo,
      answered: run.answered,
      mode: activeMode.title,
      durationMs: Date.now() - run.startedAt,
      avgAnswerMs: run.answered > 0 ? Math.round((Date.now() - run.startedAt) / run.answered) : 0,
      correct: run.correct,
      incorrect: run.incorrect
    }
  });

  return (
    <div className="layout math-layout trainer-game">
      <section className="card game-hud-grid">
        <div><span>Режим</span><strong>{activeMode.title}</strong></div>
        <div><span>Очки</span><strong>{run.score}</strong></div>
        <div><span>Комбо</span><strong>x{run.combo}</strong></div>
        <div><span>Таймер</span><strong>{timerLabel(run.remainingMs)}</strong></div>
        <div><span>Тир</span><strong>{flow.currentTier}</strong></div>
        <div><span>Точность</span><strong>{Math.round(flow.accuracyRate * 100)}%</strong></div>
      </section>

      {!isRoundStarted && (
        <section className="card game-start-card">
          <h2>{activeMode.title}</h2>
          <p>{activeMode.description}</p>
          <div className="row">
            <button type="button" onClick={beginRound}>Start / Play</button>
            <button type="button" onClick={() => navigate('/modes')}>Выбрать другой режим</button>
          </div>
        </section>
      )}

      {isRoundStarted && !isFinished && task && (
        <div className="trainer-problem-wrap">
          <div className="prompt">{task.prompt}</div>
          <form onSubmit={onSubmit} className="answer-form">
            <input
              autoFocus
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
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
            <button type="button" onClick={() => navigate('/modes')}>Выйти</button>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="card result-card">
          <h3>Run Complete</h3>
          <p>Score: {run.score}</p>
          <p>Correct: {run.correct} / {run.answered}</p>
          <p>Best combo: x{run.bestCombo}</p>
          <section className="trainer-progress-wrap">
            <div className="trainer-progress">
              <div style={{ width: percent(flow.accuracyRate) }} />
            </div>
          </section>
          <div className="row">
            <button onClick={beginRound} type="button">Play Again</button>
            <button onClick={goToResults} type="button">К результатам</button>
          </div>
        </div>
      )}
    </div>
  );
};
