import { EventDefinition, RunState } from '../domain/types';
import { rollRelicChoices } from './relicEngine';

const capHp = (state: RunState, hp: number) => ({
  ...state,
  player: {
    ...state.player,
    hp: Math.max(1, Math.min(state.player.maxHp, hp))
  }
});

export const createEvent = (state: RunState): EventDefinition => {
  const events: EventDefinition[] = [
    {
      id: 'blood-gold',
      title: 'Кровавый контракт',
      description: 'Обмениваешь часть жизненной силы на золото?',
      options: [
        {
          id: 'blood-gold-yes',
          label: 'Взять золото',
          description: '-8 HP, +20 золота',
          apply: (input) => ({ ...capHp(input, input.player.hp - 8), player: { ...capHp(input, input.player.hp - 8).player, gold: input.player.gold + 20 } })
        },
        { id: 'blood-gold-no', label: 'Отказаться', description: 'Без изменений', apply: (input) => input }
      ]
    },
    {
      id: 'risky-riddle',
      title: 'Рунная загадка',
      description: 'Испытание на смекалку — шанс получить реликвию.',
      options: [
        {
          id: 'riddle-accept',
          label: 'Принять риск',
          description: '50/50: реликвия или -6 HP',
          apply: (input) => {
            if (Math.random() < 0.5) {
              const relic = rollRelicChoices(1)[0];
              if (!relic) return input;
              return {
                ...input,
                pendingReward: {
                  gold: 0,
                  crystals: 0,
                  heal: 0,
                  relicChoices: [relic],
                  source: 'event'
                }
              };
            }
            return capHp(input, input.player.hp - 6);
          }
        },
        { id: 'riddle-leave', label: 'Уйти', description: 'Ничего не происходит', apply: (input) => input }
      ]
    },
    {
      id: 'healing-fountain',
      title: 'Тёплый источник',
      description: 'Можно отдохнуть и восстановить силы.',
      options: [
        {
          id: 'fountain-heal',
          label: 'Исцелиться',
          description: '+12 HP',
          apply: (input) => capHp(input, input.player.hp + 12)
        }
      ]
    }
  ];

  return events[Math.floor(Math.random() * events.length)];
};
