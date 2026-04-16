import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';
import { isTerritoryAttackable } from './domain/map';
import { createInitialStrategyState, selectTerritory, startBattle, submitBattleAnswer, tickBattle } from './store/strategyGameStore';
import { ActionLog } from './ui/ActionLog';
import { BattlePanel } from './ui/BattlePanel';
import { ResourcePanel } from './ui/ResourcePanel';
import { StrategyMapView } from './ui/StrategyMap';

export const StrategyPage = () => {
  usePageMeta('Strategy Mode — Math Game', 'Захватывайте территории, решая математические задания в коротких боях.', { noindex: true });

  const [state, setState] = useState(() => createInitialStrategyState());
  const [answer, setAnswer] = useState('');
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  const selectedTerritory = useMemo(
    () => state.map.territories.find((territory) => territory.id === state.selectedTerritoryId) ?? null,
    [state.map.territories, state.selectedTerritoryId]
  );

  const canStartBattle = Boolean(
    selectedTerritory &&
    selectedTerritory.owner !== 'player' &&
    isTerritoryAttackable(state.map, selectedTerritory.id) &&
    !state.activeBattle
  );

  useEffect(() => {
    if (!state.activeBattle) return undefined;

    const timer = window.setInterval(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      setState((previous) => tickBattle(previous, timestamp));
    }, 200);

    return () => window.clearInterval(timer);
  }, [state.activeBattle]);

  useEffect(() => {
    if (state.activeBattle) {
      setQuestionStartedAt(Date.now());
      setAnswer('');
    }
  }, [state.activeBattle?.currentTask.id]);

  const remainingMs = state.activeBattle ? Math.max(0, state.activeBattle.endsAt - now) : 0;

  return (
    <div className="layout strategy-layout">
      <section className="card strategy-header-card">
        <h1>Strategy Mode (MVP)</h1>
        <p>Решайте примеры, чтобы захватывать соседние территории и усиливать империю.</p>
        <div className="row">
          <Link className="cta-link" to="/game?mode=classic">К обычному режиму</Link>
        </div>
      </section>

      <ResourcePanel map={state.map} gold={state.resources.gold} supplies={state.resources.supplies} />

      <div className="strategy-main-grid">
        <StrategyMapView
          map={state.map}
          selectedTerritoryId={state.selectedTerritoryId}
          onSelect={(territoryId) => setState((previous) => selectTerritory(previous, territoryId))}
        />

        <BattlePanel
          selectedTerritory={selectedTerritory}
          activeBattle={state.activeBattle}
          lastSummary={state.lastSummary}
          remainingMs={remainingMs}
          answer={answer}
          onAnswerChange={setAnswer}
          onStartBattle={() => {
            if (!selectedTerritory) return;
            setState((previous) => startBattle(previous, selectedTerritory.id));
          }}
          onSubmit={() => {
            if (!answer.trim()) return;
            const timestamp = Date.now();
            setNow(timestamp);
            setState((previous) => submitBattleAnswer(previous, answer, timestamp, questionStartedAt));
          }}
          canStartBattle={canStartBattle}
        />
      </div>

      <ActionLog entries={state.actionLog} />
    </div>
  );
};
