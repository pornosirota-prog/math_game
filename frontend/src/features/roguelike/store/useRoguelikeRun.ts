import { useMemo, useState } from 'react';
import { RunState } from '../domain/types';
import {
  buyShopOffer,
  canAfford,
  claimReward,
  chooseRoom,
  createInitialRunState,
  leaveRoom,
  makeSummary,
  resolveBattleAnswer,
  resolveEventOption,
  resolveRestChoice
} from './runEngine';
import { loadRoguelikeStats, saveRoguelikeStats } from '../services/persistence';

let cachedRunState: RunState | null = null;

export const useRoguelikeRun = () => {
  const [state, setState] = useState<RunState>(() => {
    if (cachedRunState) return cachedRunState;
    const initial = createInitialRunState();
    cachedRunState = initial;
    return initial;
  });
  const [persisted, setPersisted] = useState(() => loadRoguelikeStats());

  const recordDepth = useMemo(() => Math.max(persisted.bestDepth, state.depth), [persisted.bestDepth, state.depth]);

  const updateState = (updater: (current: RunState) => RunState) => {
    setState((current) => {
      const next = updater(current);
      cachedRunState = next;
      return next;
    });
  };

  const selectRoom = (roomId: string) => updateState((current) => chooseRoom(current, roomId, Date.now()));
  const submitAnswer = (answer: string) => updateState((current) => {
    const next = resolveBattleAnswer(current, answer, Date.now());
    if (next.player.hp <= 0 || next.status === 'game-over') {
      const summary = makeSummary(next, Math.max(persisted.bestDepth, next.depth));
      const stored = { bestDepth: Math.max(persisted.bestDepth, next.depth), lastSummary: summary };
      saveRoguelikeStats(stored);
      setPersisted(stored);
      return { ...next, summary, status: 'game-over' };
    }
    return next;
  });

  const takeReward = (relicId?: string) => updateState((current) => claimReward(current, relicId));
  const pickEvent = (optionId: string) => updateState((current) => {
    const next = resolveEventOption(current, optionId);
    if (next.player.hp <= 0 || next.status === 'game-over') {
      const summary = makeSummary(next, Math.max(persisted.bestDepth, next.depth));
      const stored = { bestDepth: Math.max(persisted.bestDepth, next.depth), lastSummary: summary };
      saveRoguelikeStats(stored);
      setPersisted(stored);
      return { ...next, summary, status: 'game-over' };
    }
    return next;
  });

  const rest = (mode: 'heal' | 'buff') => updateState((current) => resolveRestChoice(current, mode));
  const buyOffer = (offerId: string) => updateState((current) => buyShopOffer(current, offerId));
  const continueFromRoom = () => updateState((current) => leaveRoom(current));
  const resetRun = () => {
    const initial = createInitialRunState();
    cachedRunState = initial;
    setState(initial);
  };

  return {
    state,
    recordDepth,
    lastSummary: persisted.lastSummary,
    selectRoom,
    submitAnswer,
    takeReward,
    pickEvent,
    rest,
    buyOffer,
    continueFromRoom,
    resetRun,
    canAfford
  };
};
