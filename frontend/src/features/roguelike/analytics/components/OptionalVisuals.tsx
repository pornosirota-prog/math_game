import { PropsWithChildren } from 'react';
import { dungeonAssetManifest } from '../../assets/assetManifest';
import { useOptionalImage } from '../hooks/useOptionalImage';
import { RunRoomType } from '../models/types';

export const OptionalBackground = ({ children }: PropsWithChildren) => {
  const main = useOptionalImage(dungeonAssetManifest.backgrounds.main);
  const texture = useOptionalImage(dungeonAssetManifest.backgrounds.panelTexture);

  return (
    <div className="dungeon-analytics-bg" style={main.isLoaded ? { backgroundImage: `url(${main.src})` } : undefined}>
      <div className="dungeon-analytics-gradient" />
      {texture.isLoaded && <div className="dungeon-analytics-texture" style={{ backgroundImage: `url(${texture.src})` }} />}
      <div className="dungeon-analytics-content">{children}</div>
    </div>
  );
};

const ROOM_EMOJI: Record<RunRoomType, string> = {
  fight: '⚔️',
  elite: '💀',
  chest: '🧰',
  shop: '🛒',
  rest: '💚',
  event: '❔',
  death: '🫀'
};

export const OptionalRoomIcon = ({ roomType, className }: { roomType: RunRoomType; className?: string }) => {
  const key = roomType === 'chest' ? 'chest' : roomType;
  const src = useOptionalImage(dungeonAssetManifest.roomIcons[key]);

  if (src.isLoaded && src.src) {
    return <img src={src.src} alt={roomType} className={className ?? 'optional-icon'} />;
  }

  return <span className={className ?? 'optional-icon optional-icon-fallback'}>{ROOM_EMOJI[roomType]}</span>;
};

export const OptionalEnemyPortrait = ({ enemyName }: { enemyName?: string }) => {
  const sample = enemyName?.toLowerCase().includes('mage')
    ? dungeonAssetManifest.enemies.mage
    : enemyName?.toLowerCase().includes('gob')
      ? dungeonAssetManifest.enemies.goblin
      : dungeonAssetManifest.enemies.skeleton;
  const image = useOptionalImage(sample);

  return image.isLoaded && image.src
    ? <img src={image.src} alt={enemyName ?? 'enemy'} className="optional-portrait" />
    : <img src={dungeonAssetManifest.fallback.enemy} alt="enemy placeholder" className="optional-portrait" />;
};

export const OptionalRelicArt = ({ relicId }: { relicId?: string }) => {
  const src = relicId?.includes('shield')
    ? dungeonAssetManifest.relics.relicShield
    : relicId?.includes('crystal')
      ? dungeonAssetManifest.relics.relicCrystal
      : dungeonAssetManifest.relics.relicBook;
  const image = useOptionalImage(src);
  return image.isLoaded && image.src
    ? <img src={image.src} alt="relic" className="optional-portrait" />
    : <img src={dungeonAssetManifest.fallback.relic} alt="relic placeholder" className="optional-portrait" />;
};
