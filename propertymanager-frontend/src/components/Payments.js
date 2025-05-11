// src/components/Payments.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import LoadingSpinner from './LoadingSpinner';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [leases, setLeases] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    try {
      // Dekodujemy token, żeby pozyskać user_id
      const token = localStorage.getItem('access_token');
      if (token) {
        const { user_id } = jwtDecode(token);
        setCurrentUserId(user_id);
      }

      // Pobieramy płatności i umowy
      const [payRes, leaseRes] = await Promise.all([
        api.get('/payments/'),
        api.get('/leases/')
      ]);
      setPayments(payRes.data);
      setLeases(leaseRes.data);
    } catch (err) {
      console.error('Błąd ładowania danych:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const formatDate = iso =>
    iso ? new Date(iso).toLocaleDateString('pl-PL') : '';

  const handleEdit = id => {
    navigate(`/editpayment/${id}`);
  };

  // Funkcja pobierająca fakturę PDF
  const downloadInvoice = (id, invoiceNumber) => {
    api.get(`/payments/${id}/invoice/`, { responseType: 'blob' })
      .then(res => {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: 'application/pdf' })
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `faktura_${invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(err => {
        console.error('Błąd pobierania faktury:', err);
        alert('Nie udało się pobrać faktury.');
      });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Płatności
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate('/addpayment')}
        sx={{ mb: 2 }}
      >
        Dodaj płatność
      </Button>

      {payments.length === 0 ? (
        <Typography>Brak płatności do wyświetlenia.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Nieruchomość</TableCell>
              <TableCell>Kontrahent</TableCell>
              <TableCell>Tytuł</TableCell>
              <TableCell>Opis</TableCell>
              <TableCell align="right">Kwota</TableCell>
              <TableCell>Opłacone</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map(p => {
              // Znajdź pełne dane umowy
              const leaseFull = leases.find(l => l.id === p.lease.id);
              const leaseData = leaseFull ?? p.lease;

              // Id właściciela i najemcy
              const ownerId = leaseFull?.owner_info?.id ?? leaseData.property.owner;
              const tenantId = leaseFull?.tenant_info?.id ?? p.lease.tenant;

              // Czy bieżący użytkownik jest właścicielem tej płatności?
              const isOwner = currentUserId === ownerId;

              // Ustal, kogo wyświetlić jako "kontrahenta"
              let other;
              if (leaseFull) {
                const u = isOwner
                  ? leaseFull.tenant_info
                  : leaseFull.owner_info;
                other = `${u.first_name} ${u.last_name} (${u.username})`;
              } else {
                // Fallback na ID, jeśli brak pełnych danych
                other = isOwner
                  ? `Najemca ID: ${tenantId}`
                  : `Właściciel ID: ${ownerId}`;
              }

              // Nazwa nieruchomości
              const propertyName =
                leaseFull?.property_info?.name || `ID: ${leaseData.property.id}`;

              return (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.date)}</TableCell>
                  <TableCell>{propertyName}</TableCell>
                  <TableCell>{other}</TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell align="right">
                    {parseFloat(p.amount).toFixed(2)} zł
                  </TableCell>
                  <TableCell>{p.is_paid ? '✅' : '❌'}</TableCell>
                  <TableCell>
                    {isOwner && (
                      <Button size="small" onClick={() => handleEdit(p.id)}>
                        Edytuj
                      </Button>
                    )}
                    <Button
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={() => downloadInvoice(p.id, p.invoice_number)}
                    >
                      Faktura
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
