import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Alert, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AddPayment() {
  const [form, setForm] = useState({
    lease: '',
    title: '',
    description: '',
    date: '',
    amount: '',
    is_paid: false
  });
  const [leases, setLeases] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // pobierz listę umów
    api.get('/leases/')
      .then(res => setLeases(res.data))
      .catch(err => console.error('Nie udało się pobrać umów:', err));
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.lease) {
      setError('Wybierz umowę.');
      return;
    }
    try {
      await api.post('/payments/', {
        lease: parseInt(form.lease, 10),
        title: form.title,
        description: form.description,
        date: form.date,
        amount: parseFloat(form.amount),
        is_paid: form.is_paid
      });
      navigate('/payments');
    } catch (err) {
      console.error('Błąd przy dodawaniu płatności:', err);
      const msg = err.response?.data?.detail || 'Nie udało się dodać płatności.';
      setError(msg);
    }
  };

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h5" mb={2}>Dodaj płatność</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Wybierz umowę"
          name="lease"
          value={form.lease}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        >
          {leases.map(l => (
            <MenuItem key={l.id} value={l.id}>
              {l.property_info.name} — 
              {l.tenant_info.username === l.tenant_info.username /* dummy */}
              {' '}
              {l.tenant_info.username !== undefined 
                ? `Najemca: ${l.tenant_info.username}` 
                : `Właściciel: ${l.owner_info.username}`}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Tytuł"
          name="title"
          value={form.title}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <TextField
          label="Opis"
          name="description"
          value={form.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Data"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Kwota"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          fullWidth
          required
          inputProps={{ step: "0.01" }}
          sx={{ mb: 2 }}
        />

        <Box display="flex" alignItems="center" mb={2}>
          <input
            type="checkbox"
            id="is_paid"
            name="is_paid"
            checked={form.is_paid}
            onChange={handleChange}
          />
          <label htmlFor="is_paid" style={{ marginLeft: 8 }}>Opłacone</label>
        </Box>

        <Button type="submit" variant="contained">
          Dodaj
        </Button>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          onClick={() => navigate('/payments')}
        >
          Anuluj
        </Button>
      </form>
    </Box>
  );
}
