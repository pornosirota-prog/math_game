import { StrategyMap } from '../domain/types';

interface StrategyMapProps {
  map: StrategyMap;
  selectedTerritoryId: string | null;
  onSelect: (territoryId: string) => void;
}

const ownerClass = (owner: 'player' | 'neutral') => (owner === 'player' ? 'owned' : 'neutral');

export const StrategyMapView = ({ map, selectedTerritoryId, onSelect }: StrategyMapProps) => (
  <section className="card strategy-map-card">
    <div className="strategy-map-grid">
      {map.territories.map((territory) => (
        <button
          key={territory.id}
          type="button"
          className={`strategy-tile ${ownerClass(territory.owner)}${selectedTerritoryId === territory.id ? ' selected' : ''}`}
          onClick={() => onSelect(territory.id)}
        >
          <strong>{territory.name}</strong>
          <span className="strategy-tile-type">{territory.type}</span>
        </button>
      ))}
    </div>
  </section>
);
