import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const modes = [
  ['Classic', 'Сбалансированные задания для ежедневной практики.'],
  ['Sprint', 'Максимум очков за короткий таймер и динамичный темп.'],
  ['Survival', 'Ошибки опасны — держи концентрацию до конца раунда.'],
  ['Training', 'Спокойный режим для развития навыка без лишнего давления.']
];

export const LandingPage = () => {
  usePageMeta(
    'Math Game — тренажёр устного счёта',
    'Играй в математические режимы, прокачивай уровень, закрывай daily challenge и соревнуйся за рекорды.',
    { canonicalPath: '/' }
  );

  return (
    <div className="layout">
      <section className="card landing-hero">
        <p className="hero-kicker">Math Neon Arena</p>
        <h1>Math Game — математика как игровая аркада</h1>
        <p>
          Быстрые математические раунды, прогрессия, достижения и ежедневные челленджи в одном веб‑продукте.
        </p>
        <div className="row">
          <Link className="cta-link" to="/login">Играть бесплатно</Link>
          <Link className="cta-link secondary" to="/how-to-play">Как играть</Link>
        </div>
      </section>

      <section className="card quick-grid">
        <article>
          <h2>Как это работает</h2>
          <p>Выберите режим, решайте примеры и отслеживайте прогресс по очкам, точности и скорости реакции.</p>
        </article>
        <article>
          <h2>Адаптивная сложность</h2>
          <p>Движок подстраивает нагрузку под ваш темп: ускоряет при успехе и смягчает при сериях ошибок.</p>
        </article>
        <article>
          <h2>Ежедневная практика</h2>
          <p>Daily challenge помогает удерживать привычку и видеть стабильный рост навыка по дням.</p>
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

      <section className="card quick-grid">
        <article>
          <h2>Публичные разделы</h2>
          <p>Перед регистрацией можно изучить правила, режимы, FAQ и политику конфиденциальности.</p>
          <div className="row">
            <Link className="text-link" to="/about">О проекте</Link>
            <Link className="text-link" to="/faq">FAQ</Link>
            <Link className="text-link" to="/daily-challenge">Daily Challenge</Link>
          </div>
        </article>
        <article className="ad-slot-placeholder compact" aria-label="Резерв для будущей рекламы">
          <h3>Рекламная зона (резерв)</h3>
          <p>Место для будущего аккуратного размещения рекламных блоков без перестройки интерфейса.</p>
        </article>
      </section>
    </div>
  );
};
