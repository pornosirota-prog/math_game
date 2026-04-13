import { FormEvent, useState } from 'react';
import { gameApi } from '../api/gameApi';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState('demo@game.local');
  const [password, setPassword] = useState('demo123');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await gameApi.login(email, password);
    setToken(response.data.token);
    navigate('/game');
  };

  return (
    <div className="layout card">
      <h2>Login</h2>
      <form onSubmit={submit} className="row">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Login</button>
      </form>
      <p><Link to="/register">Need an account? Register</Link></p>
      <a href="http://localhost:8080/oauth2/authorization/google">Login with Google</a>
    </div>
  );
};
