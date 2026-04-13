import { useEffect, useState } from 'react';
import { gameApi } from '../api/gameApi';
import { BoostDto, ChestDefinition, OpenChestResponse, PlayerProgress } from '../types/game';

export const useGameData = () => {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [chests, setChests] = useState<ChestDefinition[]>([]);
  const [boosts, setBoosts] = useState<BoostDto[]>([]);
  const [lastReward, setLastReward] = useState<OpenChestResponse | null>(null);

  const reload = async () => {
    const [progressRes, chestsRes, boostsRes] = await Promise.all([
      gameApi.progress(), gameApi.chests(), gameApi.boosts()
    ]);
    setProgress(progressRes.data);
    setChests(chestsRes.data);
    setBoosts(boostsRes.data);
  };

  useEffect(() => { reload().catch(console.error); }, []);

  return { progress, chests, boosts, lastReward, setLastReward, reload };
};
