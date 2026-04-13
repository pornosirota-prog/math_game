import { Link, useLocation } from 'react-router-dom';

interface ResultState {
  score: number;
  accuracy: number;
  bestCombo: number;
  answered: number;
  mode: string;
}

export const ResultsPage = () => {
  const location = useLocation();
  const state = (location.state as ResultState | null) ?? null;

  return (
    <div className="layout card">
      <h2>Результаты матча</h2>
      {state ? (
        <>
          <p>Режим: {state.mode}</p>
          <p>Итоговый счёт: {state.score}</p>
          <p>Точность: {state.accuracy}%</p>
          <p>Лучшая серия: x{state.bestCombo}</p>
          <p>Решено задач: {state.answered}</p>
        </>
      ) : (
        <p>Сыграйте раунд, чтобы увидеть подробные результаты.</p>
      )}
      <div className="row">
        <Link className="cta-link" to="/modes">Сыграть ещё</Link>
        <Link className="cta-link secondary" to="/dashboard">Домой</Link>
      </div>
    </div>
  );
};
