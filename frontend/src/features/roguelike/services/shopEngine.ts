import { rollRelicChoices } from './relicEngine';
import { PlayerState, ShopOffer } from '../domain/types';

const clampHeal = (player: PlayerState, amount: number): PlayerState => ({
  ...player,
  hp: Math.min(player.maxHp, player.hp + amount)
});

export const createShopOffers = (): ShopOffer[] => {
  const relic = rollRelicChoices(1)[0];

  return [
    {
      id: 'shop-heal',
      label: 'Зелье лечения',
      description: 'Восстановить 14 HP.',
      costGold: 24,
      apply: (player) => clampHeal(player, 14)
    },
    {
      id: 'shop-damage',
      label: 'Заточка клинка',
      description: '+1 к базовому урону до конца run.',
      costGold: 30,
      apply: (player) => ({ ...player, baseDamage: player.baseDamage + 1 })
    },
    {
      id: 'shop-speed',
      label: 'Часы алхимика',
      description: '+10% к speed bonus.',
      costGold: 28,
      apply: (player) => ({ ...player, speedBonusMultiplier: player.speedBonusMultiplier + 0.1 })
    },
    ...(relic
      ? [{
          id: `shop-relic-${relic.id}`,
          label: `Реликвия: ${relic.title}`,
          description: relic.description,
          costGold: relic.rarity === 'epic' ? 54 : relic.rarity === 'rare' ? 42 : 36,
          apply: (player: PlayerState) => ({ ...player, relicIds: [...player.relicIds, relic.id] })
        }]
      : [])
  ];
};
