import { RoomDefinition, RoomType } from '../domain/types';

const roomWeights: Record<RoomType, number> = {
  fight: 46,
  treasure: 14,
  event: 14,
  shop: 10,
  rest: 12,
  elite: 4
};

const roomNames: Record<RoomType, string[]> = {
  fight: ['Зал костей', 'Логово стражей', 'Крепкий страж'],
  treasure: ['Сокровищница', 'Забытый тайник', 'Сломанный сейф'],
  event: ['Странный алтарь', 'Руна судьбы', 'Колодец шёпотов'],
  shop: ['Лавка торговца', 'Палатка контрабандиста', 'Чёрный рынок'],
  rest: ['Тихий костёр', 'Комната отдыха', 'Укрытие путника'],
  elite: ['Проклятая арена', 'Тронный склеп', 'Зал чемпиона']
};

const rollRoomType = (depth: number, history: RoomType[]): RoomType => {
  const mutable = { ...roomWeights };
  const previous = history[history.length - 1];
  if (previous === 'rest') mutable.rest = 2;
  if (previous === 'shop') mutable.shop = 2;
  if (depth < 4) mutable.elite = 0;

  const total = Object.values(mutable).reduce((acc, current) => acc + current, 0);
  let cursor = Math.random() * total;

  for (const [roomType, weight] of Object.entries(mutable) as Array<[RoomType, number]>) {
    cursor -= weight;
    if (cursor <= 0) return roomType;
  }

  return 'fight';
};

export const generateRoomChoices = (depth: number, history: RoomType[]): RoomDefinition[] =>
  Array.from({ length: 3 }, (_, index) => {
    const type = rollRoomType(depth, history);
    const title = roomNames[type][Math.floor(Math.random() * roomNames[type].length)];
    return {
      id: `room-${depth}-${index}-${type}`,
      type,
      title,
      description: type === 'fight' || type === 'elite' ? 'Сражение через математические ответы.' : 'Неизвестная комната с выбором.',
      risk: type === 'elite' ? 5 : type === 'fight' ? 3 : type === 'event' ? 2 : 1,
      rewardHint:
        type === 'fight' || type === 'elite'
          ? 'Золото, кристаллы, шанс реликвии'
          : type === 'shop'
            ? 'Покупка усилений'
            : type === 'rest'
              ? 'Восстановление HP'
              : 'Случайная награда'
    };
  });
