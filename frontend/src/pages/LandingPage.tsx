import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const modes = [
  ['Classic', 'Сбалансированные задания для ежедневной практики.'],
  ['Sprint', 'Максимум очков за короткий таймер.'],
  ['Survival', 'Ошибки опасны — держи концентрацию.'],
  ['Training', 'Спокойный режим для прокачки навыка.']
];

export const LandingPage = () => {
  usePageMeta('Math Game — тренажёр устного счёта', 'Играй в математические режимы, прокачивай уровень, закрывай daily challenge и соревнуйся за рекорды.');

  return (
    <div className="layout">
      <section className="card landing-hero">
        <p className="hero-kicker">Math Neon Arena</p>
        <h1>Math Game — математика как игровая аркада</h1>
        <p>
          Быстрые математические раунды, прогрессия, достижения и ежедневные челленджи в одном веб‑продукте.
        </p>
        <div className="row">
          <Link className="cta-link" to="/register">Играть бесплатно</Link>
          <Link className="cta-link secondary" to="/login">Войти</Link>
        </div>
      </section>

      <section className="card quick-grid">
        <article>
          <h2>Как это работает</h2>
          <p>Выбери режим, нажми Start, решай примеры и анализируй результат.</p>
        </article>
        <article>
          <h2>Преимущества</h2>
          <p>Адаптивная сложность, локальная статистика и персональные цели.</p>
        </article>
        <article>
          <h2>Прогрессия</h2>
          <p>Уровни, очки опыта, достижения и дневные награды.</p>
        </article>
      </section>

      <section className="card quick-grid">
        {modes.map(([title, description]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
};
