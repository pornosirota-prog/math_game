import { useMemo } from 'react';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';
import { usePageMeta } from '../hooks/usePageMeta';

export const LeaderboardPage = () => {
  usePageMeta('Рейтинг — Math Game', 'Лидерборд игроков без дублей: количество игр, лучший счёт и уровень.');

  const { leaderboard } = useMathTrainer({ autoStart: false });

  const playersLeaderboard = useMemo(() => {
    const grouped = leaderboard.reduce<Record<string, {
      playerName: string;
      gamesPlayed: number;
      bestScore: number;
      bestLevel: number;
      lastPlayedAt: string;
    }>>((acc, row) => {
      const playerName = row.playerName?.trim() || 'Player';
      const current = acc[playerName] ?? {
        playerName,
        gamesPlayed: 0,
        bestScore: 0,
        bestLevel: 0,
        lastPlayedAt: row.createdAt
      };
      const bestScore = Math.max(current.bestScore, row.score);
      const bestLevel = Math.max(current.bestLevel, row.levelReached);
      const lastPlayedAt = new Date(row.createdAt) > new Date(current.lastPlayedAt) ? row.createdAt : current.lastPlayedAt;
      acc[playerName] = { playerName, gamesPlayed: current.gamesPlayed + 1, bestScore, bestLevel, lastPlayedAt };
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([, values]) => values)
      .sort((a, b) => (b.bestScore - a.bestScore) || (b.bestLevel - a.bestLevel));
  }, [leaderboard]);

  return (
    <div className="layout">
      <section className="card leaderboard-card">
        <div className="leaderboard-page-header">
          <div>
            <h1>Лидерборд игроков</h1>
            <p>Один игрок = одна строка. Без повторов: показываем количество игр, лучший счёт и максимальный уровень.</p>
          </div>
          <span className="leaderboard-badge">Сезон 2026</span>
        </div>
        {playersLeaderboard.length === 0 ? (
          <p>Пока нет записей — сыграй первый матч, чтобы заполнить рейтинг.</p>
        ) : (
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Игрок</th>
                  <th>Сыграно</th>
                  <th>Лучший счёт</th>
                  <th>Уровень</th>
                  <th>Последняя игра</th>
                </tr>
              </thead>
              <tbody>
                {playersLeaderboard.map((row, index) => (
                  <tr key={row.playerName}>
                    <td>{index + 1}</td>
                    <td>{row.playerName}</td>
                    <td>{row.gamesPlayed}</td>
                    <td>{row.bestScore}</td>
                    <td>{row.bestLevel}</td>
                    <td>{new Date(row.lastPlayedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
