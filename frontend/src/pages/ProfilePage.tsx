import { useEffect, useState } from 'react';
import { PlayerProfile } from '../types/game';
import { gameApi } from '../api/gameApi';
import { useMathTrainer } from '../mathgame/engine/useMathTrainer';
import { usePageMeta } from '../hooks/usePageMeta';

export const ProfilePage = () => {
  usePageMeta('Профиль — Math Game', 'Профиль игрока: уровень, общий прогресс, любимый режим, статистика, достижения и история сессий.', { noindex: true });

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const { progress, stats, sessions, achievements } = useMathTrainer({ autoStart: false });

  useEffect(() => {
    gameApi.profile()
      .then((r) => {
        setProfile(r.data);
        if (r.data.displayName?.trim()) {
          localStorage.setItem('mathflow.playerName', r.data.displayName.trim());
        }
      })
      .catch(() => setProfile(null));
  }, []);

  const favoriteMode = Object.entries(stats.byMode).sort((a, b) => b[1].played - a[1].played)[0]?.[0] ?? 'classic';

  return (
    <div className="layout">
      <section className="card profile-main-card">
        <h1>Профиль</h1>
        <div className="profile-meta-grid">
          <p>Имя: {profile?.displayName ?? 'Player'}</p>
          <p>Email: {profile?.email ?? 'offline@local'}</p>
          <p>Уровень: {progress.level}</p>
          <p>Общий прогресс XP: {progress.xp}</p>
          <p>Любимый режим: {favoriteMode}</p>
        </div>
      </section>

      <section className="card quick-grid profile-sections">
        <article className="profile-section">
          <h3>Общая статистика</h3>
          <p>Игр: {stats.totalGames}</p>
          <p>Лучший счёт: {stats.bestScore}</p>
          <p>Средняя точность: {Math.round(stats.averageAccuracy * 100)}%</p>
        </article>
        <article className="profile-section">
          <h3>Достижения</h3>
          <p>Открыто: {achievements.filter((a) => a.unlocked).length}/{achievements.length}</p>
          <ul>
            {achievements.slice(0, 4).map((item) => <li key={item.id}>{item.title}: {item.unlocked ? '✅' : '🔒'}</li>)}
          </ul>
        </article>
        <article className="profile-section">
          <h3>История игр</h3>
          <ul>
            {sessions.slice(0, 4).map((s) => (
              <li key={s.id}>{new Date(s.playedAt).toLocaleDateString()} — {s.modeId} — {s.score}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
};
