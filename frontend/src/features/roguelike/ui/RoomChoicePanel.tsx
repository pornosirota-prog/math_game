import { RoomDefinition } from '../domain/types';
import { dungeonTheme } from '../config/theme';

const iconByRoom = {
  fight: '⚔️',
  treasure: '🧰',
  event: '✨',
  shop: '🛒',
  rest: '🔥',
  elite: '👑'
};

export const RoomChoicePanel = ({ rooms, onSelect }: { rooms: RoomDefinition[]; onSelect: (roomId: string) => void }) => (
  <section className="dungeon-room-grid">
    {rooms.map((room) => (
      <button
        key={room.id}
        type="button"
        className="dungeon-room-card"
        style={{ borderColor: dungeonTheme.roomColors[room.type] }}
        onClick={() => onSelect(room.id)}
      >
        <h3>{iconByRoom[room.type]} {room.title}</h3>
        <p>{room.description}</p>
        <p>Риск: {room.risk}/5</p>
        <small>{room.rewardHint}</small>
      </button>
    ))}
  </section>
);
