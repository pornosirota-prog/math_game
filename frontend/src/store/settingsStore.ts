import { create } from 'zustand';

interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  darkThemeEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkThemeEnabled: (enabled: boolean) => void;
}

const SETTINGS_KEY = 'user_settings';

const defaultSettings = {
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  darkThemeEnabled: true
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
      darkThemeEnabled: parsed.darkThemeEnabled ?? defaultSettings.darkThemeEnabled
    };
  } catch {
    return defaultSettings;
  }
};

const selectSettingFields = (state: SettingsState) => ({
  soundEnabled: state.soundEnabled,
  musicEnabled: state.musicEnabled,
  notificationsEnabled: state.notificationsEnabled,
  darkThemeEnabled: state.darkThemeEnabled
});

const persist = (state: Pick<SettingsState, keyof typeof defaultSettings>) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
};

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
    set({ darkThemeEnabled });
    persist(selectSettingFields(get()));
  }
}));
