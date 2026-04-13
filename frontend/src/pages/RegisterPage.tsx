import { FormEvent, useState } from 'react';
import { gameApi } from '../api/gameApi';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await gameApi.register(email, password, displayName);
    setToken(response.data.token);
    navigate('/game');
  };

  return (
    <div className="layout card">
      <h2>Register</h2>
      <form onSubmit={submit} className="row">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Create</button>
      </form>
      <p><Link to="/">Back to login</Link></p>
    </div>
  );
};
