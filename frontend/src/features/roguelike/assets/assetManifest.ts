export const dungeonAssetManifest = {
  backgrounds: {
    main: '/assets/dungeon/backgrounds/dungeon-main.webp',
    summary: '/assets/dungeon/backgrounds/dungeon-summary.webp',
    panelTexture: '/assets/dungeon/backgrounds/dungeon-panel-texture.webp'
  },
  ui: {
    frameTop: '/assets/dungeon/ui/frame-top.webp',
    cardStone: '/assets/dungeon/ui/card-stone.webp',
    torchLeft: '/assets/dungeon/ui/torch-left.webp',
    torchRight: '/assets/dungeon/ui/torch-right.webp',
    divider: '/assets/dungeon/ui/divider.webp'
  },
  roomIcons: {
    fight: '/assets/dungeon/room-icons/fight.webp',
    elite: '/assets/dungeon/room-icons/elite.webp',
    chest: '/assets/dungeon/room-icons/chest.webp',
    shop: '/assets/dungeon/room-icons/shop.webp',
    rest: '/assets/dungeon/room-icons/rest.webp',
    event: '/assets/dungeon/room-icons/event.webp',
    death: '/assets/dungeon/room-icons/death.webp'
  },
  enemies: {
    skeleton: '/assets/dungeon/enemies/skeleton.webp',
    goblin: '/assets/dungeon/enemies/goblin.webp',
    mage: '/assets/dungeon/enemies/mage.webp'
  },
  relics: {
    relicBook: '/assets/dungeon/relics/relic-book.webp',
    relicShield: '/assets/dungeon/relics/relic-shield.webp',
    relicCrystal: '/assets/dungeon/relics/relic-crystal.webp'
  },
  charts: {
    overlay: '/assets/dungeon/charts/chart-overlay.webp',
    glow: '/assets/dungeon/charts/chart-glow.webp'
  },
  fallback: {
    room: '/assets/dungeon/fallback/placeholder-room.svg',
    enemy: '/assets/dungeon/fallback/placeholder-enemy.svg',
    relic: '/assets/dungeon/fallback/placeholder-relic.svg'
  }
} as const;

export type DungeonAssetKey = keyof typeof dungeonAssetManifest;
