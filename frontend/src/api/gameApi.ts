import { apiClient } from './client';
import { BoostDto, ChestDefinition, OpenChestResponse, PlayerProfile, PlayerProgress } from '../types/game';

export const gameApi = {
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  me: () => apiClient.get<PlayerProfile>('/auth/me'),
  profile: () => apiClient.get<PlayerProfile>('/player/profile'),
  progress: () => apiClient.get<PlayerProgress>('/player/progress'),
  chests: () => apiClient.get<ChestDefinition[]>('/chest/list'),
  openChest: (chestType: string) => apiClient.post<OpenChestResponse>('/chest/open', { chestType }),
  claimDaily: () => apiClient.post<OpenChestResponse>('/rewards/daily-claim'),
  boosts: () => apiClient.get<BoostDto[]>('/boost/active')
};
