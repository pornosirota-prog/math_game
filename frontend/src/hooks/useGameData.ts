import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { gameApi } from '../api/gameApi';
import { BoostDto, ChestDefinition, OpenChestResponse, PlayerProgress } from '../types/game';
import { useAuthStore } from '../store/authStore';

export const useGameData = () => {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [chests, setChests] = useState<ChestDefinition[]>([]);
  const [boosts, setBoosts] = useState<BoostDto[]>([]);
  const [lastReward, setLastReward] = useState<OpenChestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((s) => s.setToken);

  const reload = async () => {
    setError(null);
    try {
      const [progressRes, chestsRes, boostsRes] = await Promise.all([
        gameApi.progress(), gameApi.chests(), gameApi.boosts()
      ]);
      setProgress(progressRes.data);
      setChests(chestsRes.data);
      setBoosts(boostsRes.data);
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 401) {
        setToken(null);
        setError('Сессия истекла. Войдите снова.');
        return;
      }
      setError('Не удалось загрузить данные игры. Проверьте backend и попробуйте снова.');
      throw e;
    }
  };

  useEffect(() => { reload().catch(console.error); }, []);

  return { progress, chests, boosts, lastReward, setLastReward, reload, error };
};
