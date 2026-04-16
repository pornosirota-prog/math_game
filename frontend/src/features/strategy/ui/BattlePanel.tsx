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
    {!activeBattle && (
      <div className="strategy-battle-intro">
        <h2>Захватите регион</h2>
        {selectedTerritory ? (
          <p>
            Цель: <strong>{selectedTerritory.name}</strong> ({selectedTerritory.type})
          </p>
        ) : (
          <p>Выберите соседний регион на карте, чтобы начать атаку.</p>
        )}
        <button type="button" onClick={onStartBattle} disabled={!canStartBattle}>
          Атаковать регион
        </button>
      </div>
    )}

    {activeBattle && (
      <div className="strategy-active-battle">
        <div className="strategy-battle-timer-row">
          <p className="strategy-task">{activeBattle.currentTask.prompt}</p>
          <p><strong>{Math.max(0, Math.ceil(remainingMs / 1000))}с</strong></p>
        </div>
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
        <div className="strategy-battle-meta">
          <span>Серия x{activeBattle.streak} (макс: x{activeBattle.bestStreak})</span>
          <strong>{percent(activeBattle.progress)}</strong>
        </div>
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
