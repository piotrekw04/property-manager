import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/Register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/user/register/', formData);
      alert('Rejestracja przebiegła pomyślnie! Sprawdź swoją skrzynkę e-mail i aktywuj konto.');
      navigate('/login');
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert('Wystąpił błąd podczas rejestracji');
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Login*</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <span className="error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label>Email*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Imię*</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          {errors.first_name && <span className="error">{errors.first_name}</span>}
        </div>

        <div className="form-group">
          <label>Nazwisko*</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          {errors.last_name && <span className="error">{errors.last_name}</span>}
        </div>

        <div className="form-group">
          <label>Hasło*</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Powtórz hasło*</label>
          <input
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="register-button">
          Zarejestruj się
        </button>
      </form>
      <p className="login-link">
        Masz już konto? <a href="/login">Zaloguj się</a>
      </p>
    </div>
  );
}

export default Register;