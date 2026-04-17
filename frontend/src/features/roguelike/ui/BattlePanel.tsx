import { FormEvent, useState } from 'react';
import { BattleState, PlayerState } from '../domain/types';

export const BattlePanel = ({
  battle,
  player,
  onSubmit
}: {
  battle: BattleState;
  player: PlayerState;
  onSubmit: (answer: string) => void;
}) => {
  const [answer, setAnswer] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!answer.trim()) return;
    onSubmit(answer);
    setAnswer('');
  };

  return (
    <section className="dungeon-battle">
      <h2>Бой: {battle.enemy.name}</h2>
      <p>Враг HP: {battle.enemy.hp} / {battle.enemy.maxHp}</p>
      <p>Игрок HP: {Math.round(player.hp)} / {player.maxHp} · Комбо x{player.combo}</p>
      <div className="dungeon-task">{battle.currentTask.prompt} = ?</div>
      <form onSubmit={submit} className="dungeon-answer-form">
        <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Введите ответ" autoFocus />
        <button type="submit">Ударить</button>
      </form>
      <small>Лимит для speed-bonus: {Math.ceil(battle.enemy.speedPressureMs / 1000)}с</small>
      <ul>
        {battle.actionLog.map((line) => <li key={line}>{line}</li>)}
      </ul>
    </section>
  );
};
