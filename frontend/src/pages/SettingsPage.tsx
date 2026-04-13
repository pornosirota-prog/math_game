export const SettingsPage = () => (
  <div className="layout card">
    <h2>Настройки</h2>
    <div className="quick-grid">
      <label className="setting-item"><span>Звук</span><input type="checkbox" defaultChecked /></label>
      <label className="setting-item"><span>Музыка</span><input type="checkbox" defaultChecked /></label>
      <label className="setting-item"><span>Уведомления</span><input type="checkbox" defaultChecked /></label>
      <label className="setting-item"><span>Тёмная тема</span><input type="checkbox" defaultChecked /></label>
    </div>
  </div>
);
