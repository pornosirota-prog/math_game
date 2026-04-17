import { Reward } from '../domain/types';
import { dungeonTheme } from '../config/theme';

export const RewardPanel = ({ reward, onTake }: { reward: Reward; onTake: (relicId?: string) => void }) => (
  <section className="dungeon-panel">
    <h2>Награда</h2>
    <p>🪙 +{reward.gold} · 💎 +{reward.crystals}</p>
    {reward.heal > 0 && <p>❤️ Доп. лечение: {reward.heal}</p>}

    {reward.relicChoices.length > 0 ? (
      <div className="dungeon-room-grid">
        {reward.relicChoices.map((relic) => (
          <button
            type="button"
            key={relic.id}
            className="dungeon-room-card"
            style={{ borderColor: dungeonTheme.rarityColors[relic.rarity] }}
            onClick={() => onTake(relic.id)}
          >
            <h3>{relic.title}</h3>
            <p>{relic.description}</p>
          </button>
        ))}
      </div>
    ) : (
      <button type="button" onClick={() => onTake()}>Продолжить</button>
    )}
  </section>
);
