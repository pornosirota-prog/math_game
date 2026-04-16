import { StrategyMap } from '../domain/types';
import { countCapturedTerritories } from '../domain/map';

interface ResourcePanelProps {
  map: StrategyMap;
  gold: number;
  supplies: number;
}

export const ResourcePanel = ({ map, gold, supplies }: ResourcePanelProps) => (
  <section className="card strategy-resource-card">
    <h2>Стратегический штаб</h2>
    <div className="strategy-stats-grid">
      <div><span>Золото</span><strong>{gold}</strong></div>
      <div><span>Припасы</span><strong>{supplies}</strong></div>
      <div><span>Захвачено</span><strong>{countCapturedTerritories(map)} / {map.territories.length}</strong></div>
    </div>
  </section>
);
