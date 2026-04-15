import { Link } from 'react-router-dom';
import { GameModeId } from '../mathgame/domain/types';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';
import { usePageMeta } from '../hooks/usePageMeta';

const modes: Array<{ id: GameModeId; title: string; description: string; difficulty: string; locked?: boolean }> = [
  { id: 'classic', title: 'Classic', description: 'Сбалансированный режим для ежедневной тренировки.', difficulty: 'Низкая' },
  { id: 'sprint60', title: 'Sprint 60', description: 'Максимум очков за 60 секунд.', difficulty: 'Средняя' },
  { id: 'streak', title: 'No-Miss Streak', description: 'Ошибка завершает раунд.', difficulty: 'Высокая' },
  { id: 'twenty', title: '20 Tasks', description: '20 задач на скорость и точность.', difficulty: 'Средняя' },
  { id: 'infinite', title: 'Infinite', description: 'Бесконечный режим для обучения.', difficulty: 'Низкая' },
  { id: 'equations', title: 'Equations', description: 'Алгебраические задания (planned).', difficulty: 'Высокая', locked: true }
];

export const ModeSelectionPage = () => {
  usePageMeta('Режимы — Math Game', 'Выберите игровой режим: Classic, Sprint, No-Miss Streak, 20 Tasks, Infinite и Equations.', { noindex: true });

  const { stats, progress } = useMathTrainer({ autoStart: false });

  return (
    <div className="layout">
      <h1>Выбор режима</h1>
      <div className="quick-grid">
        {modes.map((mode) => {
          const modeStats = stats.byMode[mode.id];
          const isUnlocked = !mode.locked && progress.unlockedModes.includes(mode.id);

          return (
            <article className="card" key={mode.id}>
              <h3>{mode.title}</h3>
              <p>{mode.description}</p>
              <p>Сложность: {mode.difficulty}</p>
              <p>Лучший рекорд: {modeStats?.bestScore ?? 0}</p>
              <p>Статус: {isUnlocked ? 'Открыт' : 'Locked / planned'}</p>
              {isUnlocked ? (
                <Link className="cta-link" to={`/game?mode=${mode.id}`}>Start</Link>
              ) : (
                <button type="button" disabled>Скоро</button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
