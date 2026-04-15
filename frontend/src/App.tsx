import { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { ModeSelectionPage } from './pages/ModeSelectionPage';
import { SettingsPage } from './pages/SettingsPage';
import { ResultsPage } from './pages/ResultsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';
import { SiteFooter } from './components/footer/SiteFooter';
import { InfoPage } from './pages/info/InfoPage';

const SIDEBAR_STORAGE_KEY = 'mathgame:sidebar-collapsed';

type NavEntry = {
  to: string;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavEntry[] = [
  { to: '/dashboard', label: 'Главная', icon: '🏠' },
  { to: '/game?mode=classic', label: 'Играть', icon: '🎮' },
  { to: '/modes', label: 'Режимы', icon: '🧩' },
  { to: '/leaderboard', label: 'Рейтинг', icon: '🏆' },
  { to: '/achievements', label: 'Достижения', icon: '⭐' },
  { to: '/profile', label: 'Профиль', icon: '👤' },
  { to: '/settings', label: 'Настройки', icon: '⚙️' }
];

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

  if (token) return null;

  return (
    <header className="layout app-topbar">
      <NavLink className="brand-link" to="/">
        <span className="brand-title">MATH GAME</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/login">Войти</NavLink>
      </div>
    </header>
  );
};

const SidebarNavigationItem = ({ item, collapsed, closeOnNavigate }: {
  item: NavEntry;
  collapsed: boolean;
  closeOnNavigate: () => void;
}) => (
  <NavLink
    to={item.to}
    className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
    onClick={closeOnNavigate}
    title={collapsed ? item.label : undefined}
  >
    <span className="sidebar-nav-icon" aria-hidden>{item.icon}</span>
    <span className="sidebar-nav-label">{item.label}</span>
  </NavLink>
);

const Sidebar = ({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}) => (
  <aside className={`app-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
    <div className="sidebar-header">
      <span className="sidebar-brand">MG</span>
      <button
        type="button"
        className="sidebar-collapse-toggle"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Раскрыть боковую панель' : 'Свернуть боковую панель'}
        title={collapsed ? 'Раскрыть' : 'Свернуть'}
      >
        {collapsed ? '»' : '«'}
      </button>
    </div>

    <nav className="sidebar-nav" aria-label="Основная навигация">
      {NAV_ITEMS.map((item) => (
        <SidebarNavigationItem
          key={item.label}
          item={item}
          collapsed={collapsed}
          closeOnNavigate={onCloseMobile}
        />
      ))}
    </nav>
  </aside>
);

const TopBar = ({ onMobileMenu }: { onMobileMenu: () => void }) => {
  const setToken = useAuthStore((s) => s.setToken);

  return (
    <header className="shell-topbar">
      <div className="shell-topbar-left">
        <button type="button" className="mobile-menu-toggle" onClick={onMobileMenu} aria-label="Открыть меню">
          ☰
        </button>
        <div>
          <p className="shell-overline">Adaptive Trainer</p>
          <strong className="shell-title">Math Game</strong>
        </div>
      </div>

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
  );
};

const AppShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const value = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    setCollapsed(value === '1');
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  };

  const shellClass = useMemo(() => `app-shell-modern${collapsed ? ' sidebar-collapsed' : ''}`, [collapsed]);

  return (
    <div className={shellClass}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && <button type="button" className="sidebar-backdrop" aria-label="Закрыть меню" onClick={() => setMobileOpen(false)} />}

      <div className="shell-main-column">
        <TopBar onMobileMenu={() => setMobileOpen((prev) => !prev)} />
        <main className="shell-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const themeId = useSettingsStore((state) => state.themeId);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    document.body.dataset.theme = themeId;
  }, [themeId]);

  return (
    <>
      <PublicHeader />
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
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
          <Route path="leaderboard" element={<LeaderboardPage />} />
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
