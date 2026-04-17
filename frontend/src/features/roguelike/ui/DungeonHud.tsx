import { Link } from 'react-router-dom';
import { dungeonTheme } from '../config/theme';
import { PlayerState } from '../domain/types';

export const DungeonHud = ({ player, depth, recordDepth }: { player: PlayerState; depth: number; recordDepth: number }) => (
  <header className="dungeon-hud" style={{ boxShadow: dungeonTheme.shadow }}>
    <div className="dungeon-hud-stats">
      <span>❤️ {Math.round(player.hp)} / {player.maxHp}</span>
      <span>🛡️ {player.armor}</span>
      <span>🪙 {player.gold}</span>
      <span>💎 {player.crystals}</span>
      <span>⬇️ Глубина {depth}</span>
      <span>🏆 Рекорд {recordDepth}</span>
    </div>
    <div className="dungeon-hud-links">
      <Link to="/game?mode=classic">Классический режим</Link>
      <Link to="/modes">Все режимы</Link>
    </div>
  </header>
);
