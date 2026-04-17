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

export const useRoguelikeRun = () => {
  const [state, setState] = useState<RunState>(() => createInitialRunState());
  const [persisted, setPersisted] = useState(() => loadRoguelikeStats());

  const recordDepth = useMemo(() => Math.max(persisted.bestDepth, state.depth), [persisted.bestDepth, state.depth]);

  const selectRoom = (roomId: string) => setState((current) => chooseRoom(current, roomId, Date.now()));
  const submitAnswer = (answer: string) => setState((current) => {
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

  const takeReward = (relicId?: string) => setState((current) => claimReward(current, relicId));
  const pickEvent = (optionId: string) => setState((current) => {
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

  const rest = (mode: 'heal' | 'buff') => setState((current) => resolveRestChoice(current, mode));
  const buyOffer = (offerId: string) => setState((current) => buyShopOffer(current, offerId));
  const continueFromRoom = () => setState((current) => leaveRoom(current));
  const resetRun = () => setState(createInitialRunState());

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
