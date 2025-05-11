import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Alert } from '@mui/material';
import api from '../api';

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
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}>
      <h2>Ustaw nowe hasło</h2>
      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nowe hasło"
          name="new_password"
          type="password"
          value={form.new_password}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Powtórz nowe hasło"
          name="re_new_password"
          type="password"
          value={form.re_new_password}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth>
          Zresetuj hasło
        </Button>
      </form>
    </Box>
  );
}
