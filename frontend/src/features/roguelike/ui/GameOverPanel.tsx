import { RunSummary } from '../domain/types';

export const GameOverPanel = ({ summary, onRestart }: { summary: RunSummary | null; onRestart: () => void }) => (
  <section className="dungeon-panel">
    <h2>Забег завершён</h2>
    {summary ? (
      <ul>
        <li>Глубина: {summary.depthReached}</li>
        <li>Комнат пройдено: {summary.roomsCleared}</li>
        <li>Врагов побеждено: {summary.enemiesDefeated}</li>
        <li>Лучшая серия: x{summary.bestCombo}</li>
        <li>Решено задач: {summary.totalSolved}</li>
        <li>Точность: {Math.round(summary.accuracy * 100)}%</li>
        <li>Рекорд: {summary.recordDepth}</li>
      </ul>
    ) : <p>Статистика не найдена.</p>}
    <button type="button" onClick={onRestart}>Новый забег</button>
  </section>
);
