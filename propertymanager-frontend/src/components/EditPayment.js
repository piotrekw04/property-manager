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
import '../css/EditPayment.css';

export default function EditPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    api.get('/user/profile/')
      .then(res => setCurrentUser(res.data))
      .catch(err => console.error(err));
  }, []);

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

  const leaseObj = leases.find(l => l.id === form.lease) || {};
  const isOwner = currentUser
    && leaseObj.owner_info
    && currentUser.id === leaseObj.owner_info.id;

  const otherParty = leaseObj.tenant_info && leaseObj.owner_info
    ? isOwner
      ? `${leaseObj.tenant_info.first_name} ${leaseObj.tenant_info.last_name}`
      : `${leaseObj.owner_info.first_name} ${leaseObj.owner_info.last_name}`
    : '';

  return (
    <Box className="edit-payment-container">
      <Typography variant="h5" className="edit-payment-title">
        Edytuj płatność
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="edit-payment-form">
        <TextField
          select
          label="Umowa (nieruchomość)"
          name="lease"
          value={form.lease}
          disabled
          className="form-control"
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
          disabled
          className="form-control"
        />

        <TextField
          label="Tytuł"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="form-control"
        />

        <TextField
          label="Opis"
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          rows={3}
          className="form-control"
        />

        <TextField
          label="Data"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
          className="form-control"
        />

        <TextField
          label="Kwota"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          required
          inputProps={{ step: "0.01" }}
          className="form-control"
        />

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="is_paid"
            name="is_paid"
            checked={form.is_paid}
            onChange={handleChange}
          />
          <label htmlFor="is_paid" className="checkbox-label">
            Opłacone
          </label>
        </div>

        <div className="button-group">
          <Button type="submit" variant="contained">
            Zapisz zmiany
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
    </Box>
  );
}
