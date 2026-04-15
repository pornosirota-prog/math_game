import { usePageMeta } from '../hooks/usePageMeta';
import { ThemeId, useSettingsStore } from '../store/settingsStore';

const themeOptions: Array<{ id: ThemeId; title: string; preview: string }> = [
  { id: 'forest', title: '🌿 Forest', preview: 'Мягкая зелень и спокойный фон.' },
  { id: 'aurora', title: '🌌 Aurora', preview: 'Фиолетово-бирюзовые градиенты.' },
  { id: 'sunset', title: '🌇 Sunset', preview: 'Тёплые оранжево-розовые тона.' },
  { id: 'midnight', title: '🌙 Midnight', preview: 'Контрастная тёмная тема для ночи.' },
  { id: 'neon', title: '⚡ Neon', preview: 'Яркие акценты в стиле аркады.' },
  { id: 'candy', title: '🍬 Candy', preview: 'Яркая и лёгкая палитра.' },
  { id: 'ocean', title: '🌊 Ocean', preview: 'Холодные голубые и бирюзовые оттенки.' },
  { id: 'coffee', title: '☕ Coffee', preview: 'Тёплая тёмная тема с кофейными цветами.' }
];

export const SettingsPage = () => {
  usePageMeta('Настройки — Math Game', 'Настройки игры: смена тем с яркими визуальными вариантами оформления интерфейса.', { noindex: true });

  const { themeId, setThemeId } = useSettingsStore();

  return (
    <div className="layout card">
      <h1>Настройки</h1>
      <p>Оставили только настройку темы — выбери стиль под настроение.</p>
      <div className="quick-grid">
        {themeOptions.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`theme-preset-btn ${themeId === theme.id ? 'active' : ''}`}
            onClick={() => setThemeId(theme.id)}
          >
            <strong>{theme.title}</strong>
            <small>{theme.preview}</small>
          </button>
        ))}
      </div>
    </div>
  );
};
