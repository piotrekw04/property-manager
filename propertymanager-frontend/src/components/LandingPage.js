import { Link } from 'react-router-dom';
import '../css/LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Witaj w PropertyManager</h1>
        <p>System zarządzania nieruchomościami</p>
        <div className="auth-buttons">
          <Link to="/login" className="auth-button login">
            Zaloguj się
          </Link>
          <Link to="/register" className="auth-button register">
            Zarejestruj się
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage