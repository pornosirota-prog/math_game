import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { useAuthStore } from './store/authStore';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/" replace />;
};

const OAuthSuccess = () => {
  const setToken = useAuthStore((s) => s.setToken);
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  if (token) {
    setToken(token);
    return <Navigate to="/game" replace />;
  }
  return <Navigate to="/" replace />;
};

export default function App() {
  const token = useAuthStore((s) => s.token);
  return (
    <>
      <div className="layout row" style={{ justifyContent: 'space-between' }}>
        <h1>Idle Incremental</h1>
        <div className="row">
          {token && <Link to="/game">Game</Link>}
          {token && <Link to="/profile">Profile</Link>}
        </div>
      </div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/game" element={<RequireAuth><GamePage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      </Routes>
    </>
  );
}
