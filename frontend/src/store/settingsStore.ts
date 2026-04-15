import { create } from 'zustand';

export type ThemeId =
  | 'forest'
  | 'aurora'
  | 'sunset'
  | 'midnight'
  | 'neon'
  | 'candy'
  | 'ocean'
  | 'coffee';

interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  darkThemeEnabled: boolean;
  themeId: ThemeId;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkThemeEnabled: (enabled: boolean) => void;
  setThemeId: (themeId: ThemeId) => void;
}

const SETTINGS_KEY = 'user_settings';

const defaultSettings = {
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  darkThemeEnabled: false,
  themeId: 'forest' as ThemeId
};

const readSettings = () => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;

  try {
    const parsed = JSON.parse(raw) as Partial<typeof defaultSettings>;
    return {
      soundEnabled: parsed.soundEnabled ?? defaultSettings.soundEnabled,
      musicEnabled: parsed.musicEnabled ?? defaultSettings.musicEnabled,
      notificationsEnabled: parsed.notificationsEnabled ?? defaultSettings.notificationsEnabled,
      darkThemeEnabled: parsed.darkThemeEnabled ?? defaultSettings.darkThemeEnabled,
      themeId: parsed.themeId ?? (parsed.darkThemeEnabled ? 'midnight' : defaultSettings.themeId)
    };
  } catch {
    return defaultSettings;
  }
};

const selectSettingFields = (state: SettingsState) => ({
  soundEnabled: state.soundEnabled,
  musicEnabled: state.musicEnabled,
  notificationsEnabled: state.notificationsEnabled,
  darkThemeEnabled: state.darkThemeEnabled,
  themeId: state.themeId
});

const persist = (state: Pick<SettingsState, keyof typeof defaultSettings>) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
};

const DARK_THEME_IDS: ThemeId[] = ['midnight', 'neon', 'coffee'];

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...readSettings(),
  setSoundEnabled: (soundEnabled) => {
    set({ soundEnabled });
    persist(selectSettingFields(get()));
  },
  setMusicEnabled: (musicEnabled) => {
    set({ musicEnabled });
    persist(selectSettingFields(get()));
  },
  setNotificationsEnabled: (notificationsEnabled) => {
    set({ notificationsEnabled });
    persist(selectSettingFields(get()));
  },
  setDarkThemeEnabled: (darkThemeEnabled) => {
    const themeId: ThemeId = darkThemeEnabled ? 'midnight' : 'forest';
    set({ darkThemeEnabled, themeId });
    persist(selectSettingFields(get()));
  },
  setThemeId: (themeId) => {
    set({ themeId, darkThemeEnabled: DARK_THEME_IDS.includes(themeId) });
    persist(selectSettingFields(get()));
  }
}));
