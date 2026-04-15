import { Link } from 'react-router-dom';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';
import { usePageMeta } from '../hooks/usePageMeta';

export const DashboardPage = () => {
  usePageMeta('Dashboard — Math Game', 'Центр игрока: уровень, лучший результат, daily challenge, режимы и визуальная статистика прогресса.', { noindex: true });

  const { progress, stats, sessions, achievements, dailyChallenge } = useMathTrainer({ autoStart: false });
  const recent = sessions[0];
  const unlockedAchievements = achievements.filter((item) => item.unlocked).length;
  const xpProgress = progress.xp % 1000;
  const recentSessions = sessions.slice(0, 8).reverse();
  const peakScore = Math.max(1, ...recentSessions.map((item) => item.score));

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

      <section className="quick-grid">
        <article className="card">
          <h3>График очков (последние игры)</h3>
          {recentSessions.length === 0 ? (
            <p>Сыграй несколько матчей, чтобы увидеть динамику очков.</p>
          ) : (
            <div className="score-sparkline" aria-label="График очков">
              {recentSessions.map((session) => (
                <div
                  className="spark-bar"
                  key={session.id}
                  title={`${session.score} очков • ${Math.round(session.accuracy * 100)}%`}
                  style={{ height: `${Math.max(8, (session.score / peakScore) * 120)}px` }}
                />
              ))}
            </div>
          )}
        </article>

        <article className="card">
          <h3>Точность (последние игры)</h3>
          {recentSessions.length === 0 ? (
            <p>Тут появится визуализация точности после игр.</p>
          ) : (
            <div className="accuracy-list">
              {recentSessions.map((session) => (
                <div className="accuracy-row" key={`${session.id}-accuracy`}>
                  <span>{new Date(session.playedAt).toLocaleDateString()}</span>
                  <strong>{Math.round(session.accuracy * 100)}%</strong>
                  <div className="xp-track">
                    <div style={{ width: `${Math.round(session.accuracy * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};
