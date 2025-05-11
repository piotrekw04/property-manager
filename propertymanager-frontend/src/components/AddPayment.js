import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/AddPayment.css';

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
    <div className="add-payment-container">
      <Typography variant="h5" className="add-payment-title">
        Dodaj płatność
      </Typography>
      {error && (
        <Alert severity="error" className="add-payment-error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="add-payment-form">
        <TextField
          className="textfield-row"
          select
          label="Wybierz umowę"
          name="lease"
          value={form.lease}
          onChange={handleChange}
          fullWidth
          required
        >
          {leases.map(l => (
            <MenuItem key={l.id} value={l.id}>
              {l.property_info.name}{' '}
              {l.tenant_info.username
                ? `— Najemca: ${l.tenant_info.username}`
                : `— Właściciel: ${l.owner_info.username}`}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          className="textfield-row"
          label="Tytuł"
          name="title"
          value={form.title}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          className="textfield-row"
          label="Opis"
          name="description"
          value={form.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
        />

        <TextField
          className="textfield-row"
          label="Data"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          className="textfield-row"
          label="Kwota"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          fullWidth
          required
          inputProps={{ step: '0.01' }}
        />

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="is_paid"
            name="is_paid"
            checked={form.is_paid}
            onChange={handleChange}
          />
          <label htmlFor="is_paid">Opłacone</label>
        </div>

        <div className="button-group">
          <Button
            type="submit"
            variant="contained"
            className="submit-button"
          >
            Dodaj
          </Button>
          <Button
            variant="outlined"
            className="cancel-button"
            onClick={() => navigate('/payments')}
          >
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  );
}
