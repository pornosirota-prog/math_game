import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { usePageMeta } from '../hooks/usePageMeta';

export const SettingsPage = () => {
  usePageMeta('Настройки — Math Game', 'Настройки игры: звук, музыка, тема, язык, управление, уведомления и безопасный logout.');

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
  const setToken = useAuthStore((state) => state.setToken);

  return (
    <div className="layout card">
      <h1>Настройки</h1>
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
        <label className="setting-item">
          <span>Язык</span>
          <select defaultValue="ru">
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="setting-item">
          <span>Управление</span>
          <select defaultValue="keyboard">
            <option value="keyboard">Keyboard</option>
            <option value="numpad">Numpad</option>
          </select>
        </label>
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        <button type="button" onClick={() => setToken(null)}>Logout</button>
      </div>
    </div>
  );
};
