import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function EditPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    lease: '', title: '', description: '',
    date: '', amount: '', is_paid: false
  });
  const [leases, setLeases] = useState([]);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Pobierz profil użytkownika
  useEffect(() => {
    api.get('/user/profile/')
      .then(res => setCurrentUser(res.data))
      .catch(err => console.error(err));
  }, []);

  // Pobierz płatność
  useEffect(() => {
    api.get(`/payments/${id}/`)
      .then(res => {
        const p = res.data;
        setForm({
          lease: p.lease.id,
          title: p.title,
          description: p.description || '',
          date: p.date,
          amount: p.amount,
          is_paid: p.is_paid
        });
      })
      .catch(() => setError('Nie udało się wczytać danych płatności.'));
  }, [id]);

  // Pobierz umowy
  useEffect(() => {
    api.get('/leases/')
      .then(res => setLeases(res.data))
      .catch(err => console.error(err));
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
    try {
      await api.patch(`/payments/${id}/`, {
        title: form.title,
        description: form.description,
        date: form.date,
        amount: parseFloat(form.amount),
        is_paid: form.is_paid
      });
      navigate('/payments');
    } catch {
      setError('Nie udało się zapisać zmian.');
    }
  };

  // Znajdź lease i sprawdź, czy jestem właścicielem
  const leaseObj = leases.find(l => l.id === form.lease) || {};
  const isOwner = currentUser
    && leaseObj.owner_info
    && currentUser.id === leaseObj.owner_info.id;

  // Ustal tekst “Druga strona”
  const otherParty = leaseObj.tenant_info && leaseObj.owner_info
    ? (isOwner
        ? `${leaseObj.tenant_info.first_name} ${leaseObj.tenant_info.last_name}`
        : `${leaseObj.owner_info.first_name} ${leaseObj.owner_info.last_name}`
      )
    : '';

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h5" mb={2}>Edytuj płatność</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Umowa (nieruchomość)"
          name="lease"
          value={form.lease}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        >
          {leases.map(l => (
            <MenuItem key={l.id} value={l.id}>
              {l.property_info.name} — najemca: {l.tenant_info.username}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Druga strona"
          value={otherParty}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />

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
          Zapisz zmiany
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
