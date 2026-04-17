import { RunSummary } from '../domain/types';

export const GameOverPanel = ({
  summary,
  onRestart,
  onViewAnalytics
}: {
  summary: RunSummary | null;
  onRestart: () => void;
  onViewAnalytics: () => void;
}) => (
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
        <li>Золото: {summary.gold}</li>
        <li>Кристаллы: {summary.crystals}</li>
        <li>Время: {Math.floor(summary.durationMs / 1000)} сек.</li>
        <li>Причина смерти: {summary.deathReason}</li>
        <li>Рекорд: {summary.recordDepth}</li>
      </ul>
    ) : <p>Статистика не найдена.</p>}
    <div className="dungeon-actions-row">
      <button type="button" onClick={onRestart}>Новый забег</button>
      <button type="button" onClick={onViewAnalytics}>Открыть аналитику</button>
    </div>
  </section>
);
