import { Link, useLocation } from 'react-router-dom';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';
import { usePageMeta } from '../hooks/usePageMeta';

interface ResultState {
  score: number;
  accuracy: number;
  bestCombo: number;
  answered: number;
  mode: string;
  durationMs: number;
  avgAnswerMs: number;
  correct: number;
  incorrect: number;
}

export const ResultsPage = () => {
  usePageMeta('Результаты — Math Game', 'Итоги раунда: счёт, точность, серия, скорость, опыт и рекомендации для следующей игры.');

  const location = useLocation();
  const state = (location.state as ResultState | null) ?? null;
  const { stats, sessions, dailyChallenge } = useMathTrainer({ autoStart: false });

  const isNewRecord = Boolean(state && state.score >= stats.bestScore);
  const xpGain = state ? Math.max(50, Math.round(state.score * 0.08)) : 0;

  return (
    <div className="layout card">
      <h1>Результаты матча</h1>
      {state ? (
        <>
          <p>Режим: {state.mode}</p>
          <p>Итоговый счёт: {state.score}</p>
          <p>{isNewRecord ? '🎉 Новый рекорд!' : 'До рекорда осталось немного'}</p>
          <p>Точность: {state.accuracy}%</p>
          <p>Среднее время ответа: {state.avgAnswerMs} мс</p>
          <p>Лучшая серия: x{state.bestCombo}</p>
          <p>Опыт за игру: +{xpGain} XP</p>
          <p>Прогресс daily challenge: {dailyChallenge.progressScore}/{dailyChallenge.targetScore}</p>
          <p>Выполненные челленджи: {dailyChallenge.completed ? '1' : '0'} сегодня</p>
          <p>Совет: попробуйте режим Sprint для тренировки скорости.</p>
        </>
      ) : (
        <p>Сыграйте раунд, чтобы увидеть подробные результаты.</p>
      )}
      {sessions.length > 0 && <p>Последняя сессия: {new Date(sessions[0].playedAt).toLocaleString()}</p>}
      <div className="row">
        <Link className="cta-link" to={state ? '/game?mode=classic' : '/modes'}>Играть снова</Link>
        <Link className="cta-link secondary" to="/modes">Выбрать режим</Link>
        <Link className="cta-link secondary" to="/dashboard">На dashboard</Link>
      </div>
    </div>
  );
};
