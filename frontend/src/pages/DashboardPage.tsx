import { Link } from 'react-router-dom';

export const DashboardPage = () => (
  <div className="layout">
    <section className="card stats-overview-grid">
      <div className="stat-pill"><span>Уровень</span><strong>12</strong></div>
      <div className="stat-pill"><span>Рекорд</span><strong>4 860</strong></div>
      <div className="stat-pill"><span>Точность</span><strong>89%</strong></div>
      <div className="stat-pill"><span>Серия входов</span><strong>7 дней</strong></div>
    </section>

    <section className="card">
      <h3>Быстрый старт</h3>
      <div className="row">
        <Link className="cta-link" to="/modes">Начать новую игру</Link>
        <Link className="cta-link secondary" to="/game?mode=classic">Продолжить классику</Link>
      </div>
    </section>

    <section className="card quick-grid">
      <article><h3>Ежедневный челлендж</h3><p>Реши 25 примеров без ошибок (16/25).</p></article>
      <article><h3>Последние достижения</h3><p>⚡ Быстрые пальцы, 🎯 95% точности.</p></article>
      <article><h3>Последняя игра</h3><p>Спринт: 3 920 очков, серия x18.</p></article>
      <article><h3>Лидерборд</h3><p>#24 за неделю, #8 среди друзей.</p></article>
    </section>
  </div>
);
