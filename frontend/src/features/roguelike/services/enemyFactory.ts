import { ENEMY_DEFINITIONS } from '../config/enemies';
import { EnemyDefinition, EnemyInstance, RoomType } from '../domain/types';

const byBehavior = (type: RoomType): EnemyDefinition[] => {
  if (type === 'elite') {
    return ENEMY_DEFINITIONS.filter((enemy) => enemy.rarity === 'elite');
  }
  return ENEMY_DEFINITIONS.filter((enemy) => enemy.rarity === 'normal');
};

export const createEnemyForRoom = (depth: number, type: RoomType, now: number): EnemyInstance => {
  const candidates = byBehavior(type);
  const selected = candidates[Math.floor(Math.random() * candidates.length)] ?? ENEMY_DEFINITIONS[0];
  const scale = 1 + depth * (selected.rarity === 'elite' ? 0.17 : 0.11);

  return {
    id: `${selected.id}-${now}`,
    defId: selected.id,
    name: selected.name,
    behavior: selected.behavior,
    rarity: selected.rarity,
    hp: Math.round(selected.baseHp * scale),
    maxHp: Math.round(selected.baseHp * scale),
    damage: Math.round(selected.baseDamage * (1 + depth * 0.08)),
    attackEveryActions: selected.attackEveryActions,
    speedPressureMs: Math.max(2200, selected.speedPressureMs - depth * 60),
    actionsUntilAttack: selected.attackEveryActions
  };
};
