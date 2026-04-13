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
    <div className="layout card">
      <h2>Profile</h2>
      <p>ID: {profile.id}</p>
      <p>Email: {profile.email}</p>
      <p>Name: {profile.displayName}</p>
      <p>Created: {new Date(profile.createdAt).toLocaleString()}</p>
    </div>
  );
};
