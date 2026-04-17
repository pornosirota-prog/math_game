import { RunAnalytics } from '../models/types';
import { OptionalRoomIcon } from './OptionalVisuals';

export const RunSummaryHeader = ({ analytics }: { analytics: RunAnalytics }) => (
  <header className="dungeon-analytics-header dungeon-analytics-card">
    <div>
      <p className="dungeon-kicker">Подземелье счёта</p>
      <h2>Аналитика забега</h2>
      <p>Провалы, ошибки и точки риска по глубине.</p>
    </div>
    <div className="dungeon-record-pill">Рекорд глубины: {analytics.bestRunDepthProfile.length}</div>
  </header>
);

export const RunSummaryCards = ({ analytics }: { analytics: RunAnalytics }) => {
  const stats = analytics.summary;
  const items = [
    ['Глубина', stats.depthReached],
    ['Комнаты', stats.roomsCleared],
    ['Враги', stats.enemiesDefeated],
    ['Золото', stats.gold],
    ['Кристаллы', stats.crystals],
    ['Max streak', stats.maxStreak],
    ['Точность', `${Math.round(stats.accuracy * 100)}%`],
    ['Время', `${Math.floor(stats.durationMs / 1000)}с`]
  ];

  return (
    <section className="dungeon-summary-grid">
      {items.map(([label, value]) => (
        <article key={label} className="dungeon-analytics-card dungeon-stat-card">
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  );
};

export const DeathReasonCard = ({ analytics }: { analytics: RunAnalytics }) => (
  <article className="dungeon-analytics-card dungeon-danger-card">
    <h3>Причина смерти</h3>
    {analytics.deathInfo ? (
      <>
        <p>{analytics.deathInfo.reason}</p>
        <p>Глубина {analytics.deathInfo.depth}, шаг {analytics.deathInfo.step}</p>
      </>
    ) : <p>Забег ещё активен.</p>}
  </article>
);

export const RunDetailsList = ({ analytics }: { analytics: RunAnalytics }) => (
  <article className="dungeon-analytics-card">
    <h3>Маршрут</h3>
    <ul className="dungeon-route-list">
      {analytics.steps.slice(-10).map((step) => (
        <li key={`${step.step}-${step.roomType}`}>
          <OptionalRoomIcon roomType={step.roomType} className="optional-icon optional-icon-fallback" />
          <span>#{step.step} · {step.roomType} · глубина {step.depth}</span>
        </li>
      ))}
    </ul>
  </article>
);

export const ProgressComparisonCard = ({ analytics }: { analytics: RunAnalytics }) => (
  <article className="dungeon-analytics-card">
    <h3>Сравнение с рекордом</h3>
    <div className="dungeon-progress-bar">
      <div style={{ width: `${Math.min(100, (analytics.summary.depthReached / Math.max(1, analytics.bestRunDepthProfile.length)) * 100)}%` }} />
    </div>
    <p>Текущий: {analytics.summary.depthReached} / Лучший: {analytics.bestRunDepthProfile.length}</p>
  </article>
);
