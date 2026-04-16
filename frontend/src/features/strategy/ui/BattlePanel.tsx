import { BattleSession, BattleSummary, Territory } from '../domain/types';

interface BattlePanelProps {
  selectedTerritory: Territory | null;
  activeBattle: BattleSession | null;
  lastSummary: BattleSummary | null;
  remainingMs: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  onStartBattle: () => void;
  canStartBattle: boolean;
}

const percent = (value: number) => `${Math.max(0, Math.min(100, Math.round(value)))}%`;

export const BattlePanel = ({
  selectedTerritory,
  activeBattle,
  lastSummary,
  remainingMs,
  answer,
  onAnswerChange,
  onSubmit,
  onStartBattle,
  canStartBattle
}: BattlePanelProps) => (
  <section className="card strategy-battle-card">
    <h2>Бой за территорию</h2>
    {selectedTerritory && (
      <p>
        Цель: <strong>{selectedTerritory.name}</strong> ({selectedTerritory.type})
      </p>
    )}

    {!activeBattle && (
      <button type="button" onClick={onStartBattle} disabled={!canStartBattle}>
        Атаковать территорию
      </button>
    )}

    {activeBattle && (
      <div className="strategy-active-battle">
        <p>Осталось времени: <strong>{Math.max(0, Math.ceil(remainingMs / 1000))}с</strong></p>
        <p>Серия: <strong>x{activeBattle.streak}</strong>, лучшая: <strong>x{activeBattle.bestStreak}</strong></p>
        <p className="strategy-task">{activeBattle.currentTask.prompt}</p>
        <div className="row">
          <input
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder="Введите ответ"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSubmit();
              }
            }}
          />
          <button type="button" onClick={onSubmit}>Ответить</button>
        </div>

        <div className="strategy-progress">
          <div style={{ width: percent(activeBattle.progress) }} />
        </div>
        <p>Прогресс захвата: <strong>{percent(activeBattle.progress)}</strong></p>
      </div>
    )}

    {lastSummary && (
      <div className="strategy-last-summary">
        <h3>{lastSummary.win ? 'Победа' : 'Поражение'}</h3>
        <p>Точность: {Math.round(lastSummary.accuracy * 100)}%</p>
        <p>Решено: {lastSummary.totalSolved}</p>
        <p>Макс. серия: x{lastSummary.comboBest}</p>
        <p>Награда: +{lastSummary.gainedResources.gold} золота, +{lastSummary.gainedResources.supplies} припасов</p>
      </div>
    )}
  </section>
);
