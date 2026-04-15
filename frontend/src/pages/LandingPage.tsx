import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const benefits = [
  {
    title: 'Адаптивная сложность',
    description: 'Система повышает или снижает уровень задач по вашей скорости и точности, чтобы тренировка оставалась полезной и посильной.'
  },
  {
    title: 'Короткие продуктивные сессии',
    description: 'Можно заниматься по 5–10 минут в день и при этом видеть рост навыка по метрикам результатов.'
  },
  {
    title: 'Прозрачный прогресс',
    description: 'Результаты раундов, достижения, рейтинг и ежедневные челленджи помогают не терять мотивацию.'
  }
];

const modeCards = [
  ['Classic', 'Базовый режим для ежедневной стабильной практики.'],
  ['Sprint', 'Высокий темп и фокус на скорости набора очков.'],
  ['Survival', 'Каждая ошибка критична — тренировка на точность.'],
  ['Training', 'Спокойная отработка вычислительных паттернов.'],
  ['Daily Challenge', 'Ежедневный контрольный раунд с понятной целью.']
];

const faq = [
  {
    q: 'Подходит ли Math Game детям и взрослым?',
    a: 'Да. Формат подходит и для учебной практики, и для поддержания навыка устного счёта во взрослом возрасте.'
  },
  {
    q: 'Что важнее: скорость или точность?',
    a: 'На длинной дистанции важны оба показателя. Рекомендуем начинать с точности и постепенно ускоряться.'
  },
  {
    q: 'Нужна ли регистрация?',
    a: 'Для сохранения прогресса, достижений и доступа к персональной статистике — да.'
  }
];

export const LandingPage = () => {
  usePageMeta(
    'Math Game — тренажёр устного счёта с режимами и ежедневным челленджем',
    'Math Game помогает развивать скорость и точность устного счёта через адаптивную сложность, игровые режимы и ежедневные задачи.'
  );

  return (
    <div className="layout public-page-layout">
      <section className="card landing-hero landing-hero-enhanced">
        <p className="hero-kicker">Math Game</p>
        <h1>Полноценный тренажёр устного счёта в игровом формате</h1>
        <p>
          Развивайте скорость и точность вычислений с помощью режимов, ежедневных челленджей и персональной аналитики прогресса.
        </p>
        <div className="row">
          <Link className="cta-link" to="/login">Начать бесплатно</Link>
          <Link className="cta-link secondary" to="/how-to-play">Как играть</Link>
        </div>
      </section>

      <section className="card">
        <h2>Почему пользователи выбирают Math Game</h2>
        <div className="quick-grid">
          {benefits.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Как начать за 3 шага</h2>
        <ol className="public-steps-list">
          <li>Зарегистрируйтесь и выберите стартовый режим.</li>
          <li>Пройдите короткий раунд и изучите экран результатов.</li>
          <li>Повторяйте ежедневную практику и отслеживайте рост показателей.</li>
        </ol>
      </section>

      <section className="card">
        <h2>Режимы тренировки</h2>
        <div className="quick-grid">
          {modeCards.map(([title, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <p>
          <Link className="text-link" to="/modes">Сравнить режимы подробнее</Link>
        </p>
      </section>

      <section className="card">
        <h2>FAQ</h2>
        <div className="faq-list">
          {faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="card public-links-card">
        <h2>Полезные страницы</h2>
        <div className="public-links-grid">
          <Link to="/about">О проекте</Link>
          <Link to="/how-to-play">Как играть</Link>
          <Link to="/daily-challenge">Daily Challenge</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/contact">Contact / Support</Link>
        </div>
      </section>

      <section className="card public-ad-slot" role="complementary" aria-label="Зона для рекламного блока">
        <h2>Ad slot (reserved)</h2>
        <p>Зона для будущего рекламного блока на landing page без подключения ad network на текущем этапе.</p>
      </section>
    </div>
  );
};
