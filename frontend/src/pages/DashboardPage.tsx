import { Link } from 'react-router-dom';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';
import { usePageMeta } from '../hooks/usePageMeta';

export const DashboardPage = () => {
  usePageMeta('Dashboard — Math Game', 'Центр игрока: уровень, лучший результат, daily challenge, режимы и краткая статистика.');

  const { progress, stats, sessions, achievements, dailyChallenge } = useMathTrainer({ autoStart: false });
  const recent = sessions[0];
  const unlockedAchievements = achievements.filter((item) => item.unlocked).length;
  const xpProgress = progress.xp % 1000;

  return (
    <div className="layout trainer-dashboard">
      <section className="card dashboard-hero">
        <h1>Привет! Готов к новому рекорду?</h1>
        <p>Уровень {progress.level} • XP {progress.xp}</p>
        <div className="xp-track"><div style={{ width: `${Math.min(100, (xpProgress / 1000) * 100)}%` }} /></div>
      </section>

      <section className="quick-grid">
        <article className="card">
          <h3>Лучший результат</h3>
          <p>{stats.bestScore}</p>
        </article>
        <article className="card">
          <h3>Последняя игра</h3>
          <p>{recent ? `${recent.score} очков • ${Math.round(recent.accuracy * 100)}%` : 'Пока нет игр'}</p>
        </article>
        <article className="card">
          <h3>Достижения</h3>
          <p>{unlockedAchievements} / {achievements.length} открыто</p>
        </article>
      </section>

      <section className="quick-grid">
        <article className="card">
          <h3>Daily challenge</h3>
          <p>Режим: {dailyChallenge.modeId}</p>
          <p>Цель: {dailyChallenge.targetScore} очков</p>
          <p>Прогресс: {dailyChallenge.progressScore} / {dailyChallenge.targetScore}</p>
          <p>Награда: +{dailyChallenge.rewardXp} XP</p>
          <Link className="cta-link" to={`/game?mode=${dailyChallenge.modeId}`}>Начать челлендж</Link>
        </article>

        <article className="card">
          <h3>Быстрый старт</h3>
          <p>Начни раунд в выбранном режиме.</p>
          <div className="row">
            <Link className="cta-link" to="/modes">Выбрать режим</Link>
            <Link className="cta-link secondary" to="/game?mode=classic">Играть Classic</Link>
          </div>
        </article>
      </section>

      <section className="card">
        <h3>Краткая статистика</h3>
        <div className="quick-grid">
          <p>Игр сыграно: <strong>{stats.totalGames}</strong></p>
          <p>Правильных: <strong>{stats.totalCorrect}</strong></p>
          <p>Неправильных: <strong>{stats.totalIncorrect}</strong></p>
          <p>Средняя точность: <strong>{Math.round(stats.averageAccuracy * 100)}%</strong></p>
          <p>Среднее время ответа: <strong>{Math.round(stats.averageAnswerMs)} мс</strong></p>
          <p>Лучший стрик: <strong>x{stats.bestStreak}</strong></p>
        </div>
      </section>
    </div>
  );
};
