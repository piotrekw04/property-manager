import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';
import api from '../api';

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/user/logout/');
    } catch (error) {
      console.error('Błąd podczas wylogowania:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('authState'); 
      
      window.dispatchEvent(new Event('storage'));
      window.location.href = '/';
    }
  };

  if (!isLoggedIn) return null;

  return (
    <nav className="nav">
      <ul className="nav-list">
        <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
        <li><Link to="/properties" className="nav-link">Nieruchomości</Link></li>
        <li><Link to="/leases" className="nav-link">Wynajmy</Link></li>
        <li><Link to="/pendingleases" className="nav-link">Oczekujące wynajmy</Link></li>
        <li><Link to="/payments" className="nav-link">Płatności</Link></li>
        <li><Link to="/chat" className="nav-link">Czat</Link></li>
        <li><Link to="/user" className="nav-link">Mój profil</Link></li>
        <li>
          <button onClick={handleLogout} className="logout-btn">
            Wyloguj
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
