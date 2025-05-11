import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Sprawdź czy użytkownik jest już zalogowany
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;  

    const checkAuth = async () => {
      try {
        await api.get('/user/profile/');
        navigate('/properties'); // Przekieruj jeśli już zalogowany
      } catch (error) {
        localStorage.removeItem('access_token');  
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/token/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      onLogin();
      navigate('/properties');
    } catch (error) {
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
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Login"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Hasło"
          required
        />
        <button type="submit">Zaloguj</button>
        <p style={{ marginTop: '1rem' }}>
          <a href="/reset-password">Zapomniałeś hasła?</a>
        </p>
      </form>
    </div>
  );
}

export default Login;