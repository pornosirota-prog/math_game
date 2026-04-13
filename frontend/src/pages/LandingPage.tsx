import { Link } from 'react-router-dom';

export const LandingPage = () => (
  <div className="layout">
    <section className="card landing-hero">
      <p className="hero-kicker">Math Neon Arena</p>
      <h1>Тренажёр, где математика превращается в игру</h1>
      <p>
        Выбирай режимы, закрывай ежедневные задания, следи за прогрессом и поднимайся в лидерборде.
      </p>
      <div className="row">
        <Link className="cta-link" to="/register">Играть бесплатно</Link>
        <Link className="cta-link secondary" to="/login">Войти</Link>
      </div>
    </section>

    <section className="card quick-grid">
      <article>
        <h3>Как это работает</h3>
        <p>Выбираешь режим → запускаешь раунд → получаешь результат и опыт.</p>
      </article>
      <article>
        <h3>Режимы</h3>
        <p>Классика, спринт, выживание, серия, уравнения и обучение.</p>
      </article>
      <article>
        <h3>Прогрессия</h3>
        <p>Уровни, достижения, ежедневки и история последних игр в одном кабинете.</p>
      </article>
    </section>
  </div>
);
