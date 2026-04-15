import { useEffect } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { ModeSelectionPage } from './pages/ModeSelectionPage';
import { SettingsPage } from './pages/SettingsPage';
import { ResultsPage } from './pages/ResultsPage';
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';
import { SiteFooter } from './components/footer/SiteFooter';
import { InfoPage } from './pages/info/InfoPage';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

const OAuthSuccess = () => {
  const setToken = useAuthStore((s) => s.setToken);
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  if (token) {
    setToken(token);
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

const PublicHeader = () => {
  const token = useAuthStore((s) => s.token);

  return (
    <header className="layout app-topbar">
      <NavLink className="brand-link" to={token ? '/dashboard' : '/'}>
        <span className="brand-title">MATH GAME</span>
      </NavLink>
      <div className="nav-links">
        {!token && <NavLink to="/login">Войти</NavLink>}
        {!token && <NavLink to="/register">Регистрация</NavLink>}
        {token && <NavLink to="/dashboard">Главная</NavLink>}
      </div>
    </header>
  );
};

const AppShell = () => {
  const setToken = useAuthStore((s) => s.setToken);

  return (
    <div className="trainer-shell">
      <header className="trainer-toolbar">
        <nav className="trainer-nav-left">
          <NavLink to="/dashboard">Главная</NavLink>
          <NavLink to="/game?mode=classic">Играть</NavLink>
          <NavLink to="/modes">Режимы</NavLink>
          <NavLink to="/leaderboard">Рейтинг</NavLink>
          <NavLink to="/achievements">Достижения</NavLink>
          <NavLink to="/profile">Профиль</NavLink>
          <NavLink to="/settings">Настройки</NavLink>
        </nav>
        <strong className="trainer-toolbar-title">MATH GAME</strong>
        <details className="profile-dropdown">
          <summary>Профиль ▾</summary>
          <div className="dropdown-menu">
            <NavLink to="/profile">Профиль</NavLink>
            <NavLink to="/settings">Настройки</NavLink>
            <NavLink to="/results">Последний результат</NavLink>
            <button type="button" onClick={() => setToken(null)}>Logout</button>
          </div>
        </details>
      </header>
      <main className="trainer-main">
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  const darkThemeEnabled = useSettingsStore((state) => state.darkThemeEnabled);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    document.body.classList.toggle('light-theme', !darkThemeEnabled);
  }, [darkThemeEnabled]);

  return (
    <>
      <PublicHeader />
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        <Route
          path="/"
          element={(
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          )}
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="modes" element={<ModeSelectionPage />} />
          <Route path="game" element={<GamePage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="leaderboard" element={<InfoPage title="Leaderboard" body="Раздел рейтинга готов для подключения серверной таблицы лидеров." />} />
          <Route path="achievements" element={<InfoPage title="Achievements" body="Здесь будут детальные карточки достижений и прогресс по бейджам." />} />
        </Route>

        <Route path="/about" element={<InfoPage title="About" body="Math Game помогает развивать скорость счёта через игровые раунды." />} />
        <Route path="/faq" element={<InfoPage title="FAQ" body="Скоро здесь появятся ответы на частые вопросы пользователей." />} />
        <Route path="/privacy" element={<InfoPage title="Privacy Policy" body="Черновик политики конфиденциальности для будущего публичного запуска." />} />
        <Route path="/terms" element={<InfoPage title="Terms" body="Черновик пользовательского соглашения." />} />
        <Route path="/support" element={<InfoPage title="Support" body="Свяжитесь с нами: support@mathgame.local" />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SiteFooter />
    </>
  );
}
