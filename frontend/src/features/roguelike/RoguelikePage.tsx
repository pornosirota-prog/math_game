import { useState } from 'react';
import { usePageMeta } from '../../hooks/usePageMeta';
import { DungeonHud } from './ui/DungeonHud';
import { useRoguelikeRun } from './store/useRoguelikeRun';
import { RoomChoicePanel } from './ui/RoomChoicePanel';
import { BattlePanel } from './ui/BattlePanel';
import { RewardPanel } from './ui/RewardPanel';
import { EventPanel } from './ui/EventPanel';
import { ShopPanel } from './ui/ShopPanel';
import { RestPanel } from './ui/RestPanel';
import { GameOverPanel } from './ui/GameOverPanel';
import { DungeonAnalyticsPage } from './analytics/components/DungeonAnalyticsPage';
import './analytics/theme/dungeonAnalytics.css';

export const RoguelikePage = () => {
  usePageMeta('Подземелье Счёта — Math Roguelike', 'Бесконечный math roguelike-lite режим с процедурными комнатами и боями.', { noindex: true });

  const {
    state,
    recordDepth,
    lastSummary,
    selectRoom,
    submitAnswer,
    takeReward,
    pickEvent,
    rest,
    buyOffer,
    continueFromRoom,
    resetRun,
    canAfford
  } = useRoguelikeRun();
  const [activeTab, setActiveTab] = useState<'play' | 'analytics'>(() => (state.status === 'game-over' ? 'analytics' : 'play'));

  return (
    <div className="layout dungeon-page">
      <div className="dungeon-tab-row">
        <button type="button" className={activeTab === 'play' ? 'active' : ''} onClick={() => setActiveTab('play')}>Играть</button>
        <button type="button" className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Статистика</button>
      </div>

      {activeTab === 'play' ? (
        <>
          <h1>Подземелье Счёта</h1>
          <p className="dungeon-lead">Бесконечный roguelike-lite режим: выбирай путь, сражайся примерами, собирай реликвии и спускайся глубже.</p>

          <DungeonHud player={state.player} depth={state.depth} recordDepth={recordDepth} />

          {state.status === 'room-choice' && <RoomChoicePanel rooms={state.roomChoices} onSelect={selectRoom} />}
          {state.status === 'battle' && state.activeBattle && <BattlePanel battle={state.activeBattle} player={state.player} onSubmit={submitAnswer} />}
          {state.status === 'reward' && state.pendingReward && <RewardPanel reward={state.pendingReward} onTake={takeReward} />}
          {state.status === 'event' && state.activeEvent && <EventPanel event={state.activeEvent} onPick={pickEvent} />}
          {state.status === 'shop' && (
            <ShopPanel
              offers={state.shopOffers}
              gold={state.player.gold}
              canAfford={canAfford}
              onBuy={buyOffer}
              onLeave={continueFromRoom}
            />
          )}
          {state.status === 'rest' && <RestPanel onRest={rest} />}
          {state.status === 'game-over' && <GameOverPanel summary={state.summary ?? lastSummary} onRestart={resetRun} onViewAnalytics={() => setActiveTab('analytics')} />}

          <section className="dungeon-panel">
            <h3>Последние действия</h3>
            <ul>
              {state.runLog.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </section>
        </>
      ) : (
        <DungeonAnalyticsPage state={state} recordDepth={recordDepth} />
      )}
    </div>
  );
};
