import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import api from '../api';

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
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}>
      <h2>Reset hasła</h2>
      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Adres e-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth>
          Wyślij link resetujący
        </Button>
      </form>
    </Box>
  );
}
