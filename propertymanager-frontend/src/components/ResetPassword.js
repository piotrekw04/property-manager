import React, { useState } from 'react';
import { TextField, Button, Alert } from '@mui/material';
import api from '../api';
import '../css/ResetPassword.css';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/user/password-reset/', { email });
      setMessage({ type: 'success', text: res.data.detail });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Wystąpił błąd.'
      });
    }
  };

  return (
    <div className="reset-password-container">
      <h2 className="reset-password-title">Reset hasła</h2>
      {message && (
        <Alert severity={message.type} className="reset-password-alert">
          {message.text}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="reset-password-form">
        <TextField
          label="Adres e-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          required
          className="reset-password-input"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          className="reset-password-button"
        >
          Wyślij link resetujący
        </Button>
      </form>
    </div>
  );
}
