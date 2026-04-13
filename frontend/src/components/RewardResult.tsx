import { OpenChestResponse } from '../types/game';
import { animationClasses } from '../animations/animationConfig';

export const RewardResult = ({ reward }: { reward: OpenChestResponse | null }) => (
  <div className={`card ${animationClasses.rewardPop}`}>
    <h3>Last Reward</h3>
    {!reward ? <p>Open a chest to see rewards.</p> : (
      <>
        <p>Chest: {reward.chestType}</p>
        <ul>
          {reward.rewards.map((r, idx) => <li key={`${r.type}-${idx}`}>{r.description}</li>)}
        </ul>
      </>
    )}
  </div>
);
