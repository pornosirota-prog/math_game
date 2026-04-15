import { FormEvent, useState } from 'react';
import { gameApi } from '../api/gameApi';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

const GOOGLE_AUTH_URL = 'http://localhost:8080/oauth2/authorization/google';

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="google-icon">
    <path fill="#FFC107" d="M43.61 20.08H42V20H24v8h11.3c-1.65 4.66-6.08 8-11.3 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.15 7.95 3.02l5.66-5.66C34.17 6.05 29.34 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92Z" />
    <path fill="#FF3D00" d="M6.31 14.69l6.57 4.82C14.66 15.1 18.99 12 24 12c3.06 0 5.84 1.15 7.95 3.02l5.66-5.66C34.17 6.05 29.34 4 24 4c-7.68 0-14.41 4.34-17.69 10.69Z" />
    <path fill="#4CAF50" d="M24 44c5.24 0 10.06-2.01 13.57-5.28l-6.27-5.3C29.24 34.98 26.72 36 24 36c-5.2 0-9.62-3.32-11.29-7.95l-6.52 5.02C9.43 39.56 16.13 44 24 44Z" />
    <path fill="#1976D2" d="M43.61 20.08H42V20H24v8h11.3a12.03 12.03 0 0 1-4.01 5.42l.01-.01 6.27 5.3C37.13 39.1 44 34 44 24c0-1.34-.14-2.65-.39-3.92Z" />
  </svg>
);

export const LoginPage = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState('demo@game.local');
  const [password, setPassword] = useState('demo123');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await gameApi.login(email, password);
    setToken(response.data.token);
    navigate('/dashboard');
  };

  return (
    <div className="layout card auth-card">
      <h2>Вход</h2>
      <form onSubmit={submit} className="row">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Войти</button>
      </form>

      <div className="auth-separator"><span>или</span></div>

      <a className="google-auth-button" href={GOOGLE_AUTH_URL}>
        <GoogleIcon />
        <span>Продолжить через Google</span>
      </a>

      <div className="auth-links">
        <Link to="/register" className="auth-link-button secondary">Нет аккаунта? Регистрация</Link>
        <Link to="/" className="auth-link-button ghost">← На главную</Link>
      </div>
    </div>
  );
};
