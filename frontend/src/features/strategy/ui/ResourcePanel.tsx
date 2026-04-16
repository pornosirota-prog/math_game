import { StrategyMap } from '../domain/types';
import { countCapturedTerritories } from '../domain/map';

interface ResourcePanelProps {
  map: StrategyMap;
  gold: number;
  supplies: number;
}

export const ResourcePanel = ({ map, gold, supplies }: ResourcePanelProps) => (
  <section className="strategy-resource-panel">
    <div className="strategy-resource-pill">
      <span>🪙</span>
      <strong>{gold}</strong>
    </div>
    <div className="strategy-resource-pill">
      <span>✦</span>
      <strong>{supplies}</strong>
    </div>
    <div className="strategy-resource-pill">
      <span>◈</span>
      <strong>{countCapturedTerritories(map)} / {map.territories.length}</strong>
    </div>
  </section>
);
