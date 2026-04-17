import { EnemyDefinition } from '../domain/types';

export const ENEMY_DEFINITIONS: EnemyDefinition[] = [
  {
    id: 'skeleton-guard',
    name: 'Скелет-страж',
    behavior: 'normal',
    rarity: 'normal',
    baseHp: 20,
    baseDamage: 6,
    attackEveryActions: 3,
    speedPressureMs: 5000
  },
  {
    id: 'goblin-raider',
    name: 'Гоблин-налётчик',
    behavior: 'aggressive',
    rarity: 'normal',
    baseHp: 18,
    baseDamage: 8,
    attackEveryActions: 2,
    speedPressureMs: 4800
  },
  {
    id: 'crypt-warden',
    name: 'Хранитель крипты',
    behavior: 'defensive',
    rarity: 'normal',
    baseHp: 24,
    baseDamage: 5,
    attackEveryActions: 3,
    speedPressureMs: 5600
  },
  {
    id: 'shade-runner',
    name: 'Теневой бегун',
    behavior: 'swift',
    rarity: 'normal',
    baseHp: 16,
    baseDamage: 7,
    attackEveryActions: 2,
    speedPressureMs: 4200
  },
  {
    id: 'bone-lord',
    name: 'Костяной лорд',
    behavior: 'elite',
    rarity: 'elite',
    baseHp: 38,
    baseDamage: 11,
    attackEveryActions: 2,
    speedPressureMs: 4400
  }
];
