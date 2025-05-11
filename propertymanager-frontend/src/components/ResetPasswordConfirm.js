import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Alert } from '@mui/material';
import api from '../api';
import '../css/ResetPasswordConfirm.css';

export default function ResetPasswordConfirm() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ new_password: '', re_new_password: '' });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `/user/password-reset-confirm/${uidb64}/${token}/`,
        form
      );
      setMessage({ type: 'success', text: res.data.detail });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data.detail || 'Błąd resetowania hasła.'
      });
    }
  };

  return (
    <div className="reset-password-confirm-container">
      <h2 className="reset-password-confirm-title">Ustaw nowe hasło</h2>
      {message && (
        <Alert
          severity={message.type}
          className="reset-password-confirm-alert"
        >
          {message.text}
        </Alert>
      )}
      <form
        onSubmit={handleSubmit}
        className="reset-password-confirm-form"
      >
        <TextField
          label="Nowe hasło"
          name="new_password"
          type="password"
          value={form.new_password}
          onChange={handleChange}
          fullWidth
          required
          className="reset-password-confirm-input"
        />
        <TextField
          label="Powtórz nowe hasło"
          name="re_new_password"
          type="password"
          value={form.re_new_password}
          onChange={handleChange}
          fullWidth
          required
          className="reset-password-confirm-input"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          className="reset-password-confirm-button"
        >
          Zresetuj hasło
        </Button>
      </form>
    </div>
  );
}
