export interface PlayerProfile {
  id: number;
  email: string;
  displayName: string;
  level: number;
  experience: number;
  coins: number;
  energy: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerProgress {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  coins: number;
  energy: number;
}

export interface ChestDefinition {
  chestType: string;
  title: string;
  description: string;
}

export interface RewardResult {
  type: string;
  description: string;
}

export interface OpenChestResponse {
  chestType: string;
  rewards: RewardResult[];
}

export interface BoostDto {
  type: string;
  multiplier: number;
  expiresAt: string;
}
