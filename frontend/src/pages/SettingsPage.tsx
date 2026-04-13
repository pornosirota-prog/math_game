import { useSettingsStore } from '../store/settingsStore';

export const SettingsPage = () => {
  const {
    soundEnabled,
    musicEnabled,
    notificationsEnabled,
    darkThemeEnabled,
    setSoundEnabled,
    setMusicEnabled,
    setNotificationsEnabled,
    setDarkThemeEnabled
  } = useSettingsStore();

  return (
    <div className="layout card">
      <h2>Настройки</h2>
      <div className="quick-grid">
        <label className="setting-item">
          <span>Звук</span>
          <input type="checkbox" checked={soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} />
        </label>
        <label className="setting-item">
          <span>Музыка</span>
          <input type="checkbox" checked={musicEnabled} onChange={(event) => setMusicEnabled(event.target.checked)} />
        </label>
        <label className="setting-item">
          <span>Уведомления</span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(event) => setNotificationsEnabled(event.target.checked)}
          />
        </label>
        <label className="setting-item">
          <span>Тёмная тема</span>
          <input
            type="checkbox"
            checked={darkThemeEnabled}
            onChange={(event) => setDarkThemeEnabled(event.target.checked)}
          />
        </label>
      </div>
    </div>
  );
};
