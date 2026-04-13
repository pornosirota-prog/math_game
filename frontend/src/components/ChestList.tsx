import { ChestDefinition } from '../types/game';

interface Props {
  chests: ChestDefinition[];
  onOpen: (chestType: string) => void;
}

export const ChestList = ({ chests, onOpen }: Props) => (
  <div className="card">
    <h3>Available Chests</h3>
    {chests.map((chest) => (
      <div key={chest.chestType} className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <b>{chest.title}</b>
          <div>{chest.description}</div>
        </div>
        <button onClick={() => onOpen(chest.chestType)}>Open</button>
      </div>
    ))}
  </div>
);
