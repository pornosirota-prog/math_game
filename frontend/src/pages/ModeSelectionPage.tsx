import { Link } from 'react-router-dom';

const modes = [
  ['classic', 'Классика', 'Сбалансированный режим для ежедневной тренировки.'],
  ['sprint', 'Спринт', 'Максимум очков за короткое время.'],
  ['survival', 'Выживание', 'Одна ошибка может завершить раунд.'],
  ['streak', 'Серия', 'Удерживай длинный стрик правильных ответов.'],
  ['equations', 'Уравнения', 'Больше алгебры и сложных задач.'],
  ['training', 'Обучение', 'Спокойный режим для новичков.']
] as const;

export const ModeSelectionPage = () => (
  <div className="layout">
    <h2>Выбор режима</h2>
    <div className="quick-grid">
      {modes.map(([id, title, description], index) => (
        <article className="card" key={id}>
          <h3>{title}</h3>
          <p>{description}</p>
          <p>Сложность: {index < 2 ? 'Низкая' : index < 4 ? 'Средняя' : 'Высокая'}</p>
          <Link className="cta-link" to={`/game?mode=${id}`}>Start</Link>
        </article>
      ))}
    </div>
  </div>
);
