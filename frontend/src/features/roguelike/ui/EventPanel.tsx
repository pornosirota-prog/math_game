import { EventDefinition } from '../domain/types';

export const EventPanel = ({ event, onPick }: { event: EventDefinition; onPick: (optionId: string) => void }) => (
  <section className="dungeon-panel">
    <h2>{event.title}</h2>
    <p>{event.description}</p>
    <div className="dungeon-room-grid">
      {event.options.map((option) => (
        <button key={option.id} type="button" className="dungeon-room-card" onClick={() => onPick(option.id)}>
          <h3>{option.label}</h3>
          <p>{option.description}</p>
        </button>
      ))}
    </div>
  </section>
);
