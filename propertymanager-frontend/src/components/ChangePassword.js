import { useState } from 'react';
import api from '../api';
import { TextField, Button, Box, Alert } from '@mui/material';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
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
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.old_password?.[0] || 'Wystąpił błąd'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <Box mb={2}>
          <Alert severity={message.type}>
            {message.text}
          </Alert>
        </Box>
      )}

      <Box mb={2}>
        <TextField
          label="Obecne hasło"
          type="password"
          value={formData.old_password}
          onChange={(e) => setFormData({...formData, old_password: e.target.value})}
          fullWidth
          required
        />
      </Box>
      <Box mb={2}>
        <TextField
          label="Nowe hasło"
          type="password"
          value={formData.new_password}
          onChange={(e) => setFormData({...formData, new_password: e.target.value})}
          fullWidth
          required
        />
      </Box>
      <Box mb={2}>
        <TextField
          label="Potwierdź nowe hasło"
          type="password"
          value={formData.confirm_password}
          onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
          fullWidth
          required
        />
      </Box>
      
      <Button type="submit" variant="contained" color="primary">
        Zmień hasło
      </Button>
    </form>
  );
}