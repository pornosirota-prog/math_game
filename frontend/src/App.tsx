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
        <span className="brand-title">Math Neon Arena</span>
      </NavLink>
      <div className="nav-links">
        {!token && <NavLink to="/login">Войти</NavLink>}
        {!token && <NavLink to="/register">Регистрация</NavLink>}
        {token && <NavLink to="/dashboard">Кабинет</NavLink>}
      </div>
    </header>
  );
};

const AppShell = () => {
  const setToken = useAuthStore((s) => s.setToken);

  return (
    <div className="app-shell">
      <aside className="sidebar card">
        <h2>Игровой центр</h2>
        <NavLink to="/dashboard">Главная</NavLink>
        <NavLink to="/modes">Режимы</NavLink>
        <NavLink to="/game?mode=classic">Играть</NavLink>
        <NavLink to="/results">Результаты</NavLink>
        <NavLink to="/profile">Профиль</NavLink>
        <NavLink to="/settings">Настройки</NavLink>
      </aside>
      <main className="shell-content">
        <header className="card shell-header">
          <div>
            <strong>Math Neon Arena</strong>
            <p>Прокачивай скорость, точность и рейтинг каждый день.</p>
          </div>
          <details className="profile-dropdown">
            <summary>Профиль ▾</summary>
            <div className="dropdown-menu">
              <NavLink to="/profile">Профиль</NavLink>
              <NavLink to="/dashboard">Моя статистика</NavLink>
              <NavLink to="/settings">Настройки</NavLink>
              <button type="button" onClick={() => setToken(null)}>Выйти</button>
            </div>
          </details>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <>
      <PublicHeader />
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
