import { ChestList } from '../components/ChestList';
import { RewardResult } from '../components/RewardResult';
import { StatPanel } from '../components/StatPanel';
import { BoostList } from '../components/BoostList';
import { useGameData } from '../hooks/useGameData';
import { gameApi } from '../api/gameApi';
import { soundManager } from '../sound/soundManager';
import { animationClasses } from '../animations/animationConfig';

export const GamePage = () => {
  const { progress, chests, boosts, lastReward, setLastReward, reload, error } = useGameData();

  const openChest = async (chestType: string) => {
    soundManager.play('click');
    const response = await gameApi.openChest(chestType);
    setLastReward(response.data);
    soundManager.play('chestOpen');
    soundManager.play('reward');
    await reload();
  };

  const claimDaily = async () => {
    const response = await gameApi.claimDaily();
    setLastReward(response.data);
    soundManager.play('reward');
    await reload();
  };

  if (error) return <div className="layout">{error}</div>;

  if (!progress) return <div className="layout">Loading...</div>;

  return (
    <div className="layout">
      <div className={animationClasses.levelUp}><StatPanel progress={progress} /></div>
      <button onClick={claimDaily}>Claim Daily Reward</button>
      <BoostList boosts={boosts} />
      <div className={animationClasses.chestOpen}><ChestList chests={chests} onOpen={openChest} /></div>
      <RewardResult reward={lastReward} />
    </div>
  );
};
