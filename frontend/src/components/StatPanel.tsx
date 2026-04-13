import { PlayerProgress } from '../types/game';

export const StatPanel = ({ progress }: { progress: PlayerProgress }) => (
  <div className="card">
    <h3>Player Progress</h3>
    <div className="row">
      <span>Level: {progress.level}</span>
      <span>EXP: {progress.experience}</span>
      <span>To next: {progress.experienceToNextLevel}</span>
      <span>Coins: {progress.coins}</span>
      <span>Energy: {progress.energy}</span>
    </div>
  </div>
);
