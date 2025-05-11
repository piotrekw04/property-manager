import { useState } from 'react';
import api from '../api';
import { TextField, Button, Alert } from '@mui/material';
import '../css/ChangePassword.css';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'Nowe hasła nie są identyczne' });
      return;
    }
    try {
      await api.post('/user/change-password/', {
        old_password: formData.old_password,
        new_password: formData.new_password
      });
      setMessage({ type: 'success', text: 'Hasło zostało zmienione' });
      setFormData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.old_password?.[0] || 'Wystąpił błąd'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="change-password-form">
      {message && (
        <div className="form-row">
          <Alert severity={message.type}>{message.text}</Alert>
        </div>
      )}
      <div className="form-row">
        <TextField
          label="Obecne hasło"
          type="password"
          fullWidth
          required
          value={formData.old_password}
          onChange={e => setFormData({ ...formData, old_password: e.target.value })}
        />
      </div>
      <div className="form-row">
        <TextField
          label="Nowe hasło"
          type="password"
          fullWidth
          required
          value={formData.new_password}
          onChange={e => setFormData({ ...formData, new_password: e.target.value })}
        />
      </div>
      <div className="form-row">
        <TextField
          label="Potwierdź nowe hasło"
          type="password"
          fullWidth
          required
          value={formData.confirm_password}
          onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
        />
      </div>
      <Button
        type="submit"
        variant="contained"
        className="submit-button"
      >
        Zmień hasło
      </Button>
    </form>
  );
}
