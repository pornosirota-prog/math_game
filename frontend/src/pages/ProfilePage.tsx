import { useEffect, useState } from 'react';
import { PlayerProfile } from '../types/game';
import { gameApi } from '../api/gameApi';

export const ProfilePage = () => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    gameApi.profile().then((r) => setProfile(r.data));
  }, []);

  if (!profile) return <div className="layout">Loading...</div>;

  return (
    <div className="layout">
      <section className="card">
        <h2>Профиль</h2>
        <p>Email: {profile.email}</p>
        <p>Имя: {profile.displayName}</p>
        <p>Уровень: 12</p>
        <p>Любимый режим: Спринт</p>
        <p>Создан: {new Date(profile.createdAt).toLocaleString()}</p>
      </section>
      <section className="card quick-grid">
        <article><h3>Статистика</h3><p>Лучший счёт: 4 860, точность: 89%.</p></article>
        <article><h3>Достижения</h3><p>14 бейджей, 3 новых за неделю.</p></article>
        <article><h3>История игр</h3><p>Последние 5 раундов доступны в результатах.</p></article>
      </section>
    </div>
  );
};
