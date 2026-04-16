import { StrategyActionLogEntry } from '../domain/types';

interface ActionLogProps {
  entries: StrategyActionLogEntry[];
}

export const ActionLog = ({ entries }: ActionLogProps) => (
  <section className="card strategy-log-card">
    <h2>История действий</h2>
    <ul>
      {entries.map((entry) => (
        <li key={entry.id}>
          <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
          <p>{entry.text}</p>
        </li>
      ))}
    </ul>
  </section>
);
