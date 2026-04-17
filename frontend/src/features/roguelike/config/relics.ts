import { RelicDefinition } from '../domain/types';

export const RELIC_DEFINITIONS: RelicDefinition[] = [
  {
    id: 'iron-chisel',
    title: 'Железное долото',
    description: '+1 базовый урон.',
    rarity: 'common',
    effect: { type: 'baseDamageFlat', value: 1 }
  },
  {
    id: 'ember-sand',
    title: 'Пепельный песок',
    description: '+15% к speed bonus.',
    rarity: 'common',
    effect: { type: 'speedBonusPercent', value: 0.15 }
  },
  {
    id: 'stone-heart',
    title: 'Каменное сердце',
    description: '+8 к максимальному HP.',
    rarity: 'rare',
    effect: { type: 'maxHpFlat', value: 8 }
  },
  {
    id: 'guild-contract',
    title: 'Контракт гильдии',
    description: '+20% золота из боёв.',
    rarity: 'rare',
    effect: { type: 'extraGoldPercent', value: 0.2 }
  },
  {
    id: 'mending-rune',
    title: 'Руна лечения',
    description: 'После победы лечит на 4 HP.',
    rarity: 'epic',
    effect: { type: 'healAfterVictory', value: 4 }
  },
  {
    id: 'guardian-sigil',
    title: 'Печать хранителя',
    description: 'Одна ошибка за бой прощается.',
    rarity: 'epic',
    effect: { type: 'forgiveMistakeOnce', value: 1 }
  }
];
