import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const checkAuth = async () => {
      try {
        await api.get('/user/profile/');
        navigate('/properties');
      } catch {
        localStorage.removeItem('access_token');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      onLogin();
      navigate('/properties');
    } catch {
      alert('Błąd logowania!');
    }
  };

  return (
    <div className="login-container">
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Login"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Hasło"
          required
        />
        <button type="submit">Zaloguj</button>
        <p className="login-forgot">
          <a href="/reset-password">Zapomniałeś hasła?</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
