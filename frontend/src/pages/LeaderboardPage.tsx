import { useMemo } from 'react';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';
import { modeRegistry } from '../mathgame/systems/ModeRegistry';
import { usePageMeta } from '../hooks/usePageMeta';

const modeLabel = (modeId: string) => modeRegistry.find((mode) => mode.id === modeId)?.title ?? modeId;

export const LeaderboardPage = () => {
  usePageMeta('Рейтинг — Math Game', 'Топ игроков, разбивка по режимам и визуальные графики прогресса.');

  const { leaderboard, sessions } = useMathTrainer({ autoStart: false });

  const topScore = leaderboard[0]?.score ?? 1;
  const modeStats = useMemo(() => {
    const grouped = leaderboard.reduce<Record<string, { count: number; bestScore: number }>>((acc, row) => {
      const current = acc[row.modeId] ?? { count: 0, bestScore: 0 };
      acc[row.modeId] = {
        count: current.count + 1,
        bestScore: Math.max(current.bestScore, row.score)
      };
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([modeId, values]) => ({ modeId, ...values }))
      .sort((a, b) => b.bestScore - a.bestScore);
  }, [leaderboard]);

  const recentScores = sessions.slice(0, 10).reverse();

  return (
    <div className="layout">
      <section className="card">
        <h1>Рейтинг</h1>
        <p>Топ результатов по всем режимам. Таблица сохраняется локально и обновляется после каждого раунда.</p>
        {leaderboard.length === 0 ? (
          <p>Пока нет записей — сыграй первый матч, чтобы заполнить рейтинг.</p>
        ) : (
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Режим</th>
                  <th>Очки</th>
                  <th>Точность</th>
                  <th>Уровень</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{modeLabel(row.modeId)}</td>
                    <td>{row.score}</td>
                    <td>{Math.round(row.accuracy * 100)}%</td>
                    <td>{row.levelReached}</td>
                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="quick-grid">
        <article className="card">
          <h3>Рекорды по режимам</h3>
          <div className="mode-bars">
            {modeStats.length === 0 ? (
              <p>Добавь несколько результатов, чтобы увидеть график.</p>
            ) : (
              modeStats.map((entry) => (
                <div className="mode-bar-row" key={entry.modeId}>
                  <strong>{modeLabel(entry.modeId)}</strong>
                  <span>{entry.bestScore} очков • {entry.count} игр</span>
                  <div className="xp-track">
                    <div style={{ width: `${Math.round((entry.bestScore / topScore) * 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="card">
          <h3>Динамика последних игр</h3>
          {recentScores.length === 0 ? (
            <p>Сыграй хотя бы одну игру, чтобы появился график.</p>
          ) : (
            <div className="score-sparkline" aria-label="График очков за последние игры">
              {recentScores.map((session) => (
                <div
                  key={session.id}
                  className="spark-bar"
                  title={`${new Date(session.playedAt).toLocaleString()} — ${session.score} очков`}
                  style={{ height: `${Math.max(8, (session.score / topScore) * 120)}px` }}
                />
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};
