import { BoostDto } from '../types/game';

export const BoostList = ({ boosts }: { boosts: BoostDto[] }) => (
  <div className="card">
    <h3>Active boosts</h3>
    {boosts.length === 0 ? <p>No active boosts.</p> : boosts.map((b) => (
      <p key={`${b.type}-${b.expiresAt}`}>{b.type}: x{b.multiplier} until {new Date(b.expiresAt).toLocaleTimeString()}</p>
    ))}
  </div>
);
