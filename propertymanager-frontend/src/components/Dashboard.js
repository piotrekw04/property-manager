import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [upcomingTenant, setUpcomingTenant] = useState([]);
  const [upcomingOwner, setUpcomingOwner] = useState([]);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/')
      .then(res => {
        setStats(res.data.stats);
        setUpcomingTenant(res.data.upcoming_tenant || []);
        setUpcomingOwner(res.data.upcoming_owner || []);
        setMessages(res.data.last_messages || []);
      })
      .catch(err => console.error(err));
  }, []);

  if (stats === null) {
    return <Typography>Ładowanie...</Typography>;
  }

  return (
    <Box p={3}>
      {/* Statystyki */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={3}>
          <Card><CardContent>
            <Typography variant="h6">Nieruchomości</Typography>
            <Typography variant="h4">{stats.total_properties}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={3}>
          <Card><CardContent>
            <Typography variant="h6">Aktywne umowy</Typography>
            <Typography variant="h4">{stats.active_leases}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={3}>
          <Card><CardContent>
            <Typography variant="h6">Oczekujące</Typography>
            <Typography variant="h4">{stats.pending_leases}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={3}>
          <Card><CardContent>
            <Typography variant="h6">Płatności (7 dni)</Typography>
            <Typography variant="h4">
              {upcomingTenant.length + upcomingOwner.length}
            </Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Nadchodzące płatności */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>Nadchodzące płatności</Typography>

        <Typography variant="subtitle1" mt={2}>Do zapłacenia</Typography>
        {upcomingTenant.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Nieruchomość</TableCell>
                <TableCell>Właściciel</TableCell>
                <TableCell align="right">Kwota</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingTenant.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{new Date(p.date).toLocaleDateString('pl-PL')}</TableCell>
                  <TableCell>{p.property}</TableCell>
                  <TableCell>{p.counterparty}</TableCell>
                  <TableCell align="right">{p.amount} zł</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2">Brak płatności do zapłacenia.</Typography>
        )}

        <Typography variant="subtitle1" mt={3}>Do odebrania</Typography>
        {upcomingOwner.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Nieruchomość</TableCell>
                <TableCell>Najemca</TableCell>
                <TableCell align="right">Kwota</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingOwner.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{new Date(p.date).toLocaleDateString('pl-PL')}</TableCell>
                  <TableCell>{p.property}</TableCell>
                  <TableCell>{p.counterparty}</TableCell>
                  <TableCell align="right">{p.amount} zł</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2">Brak płatności do odebrania.</Typography>
        )}
      </Box>

      {/* Ostatnie wiadomości */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>Ostatnie wiadomości</Typography>
        {messages.length > 0 ? messages.map((m, i) => (
          <Box key={i} mb={2} p={2} border="1px solid #ccc" borderRadius={1}>
            <Typography variant="subtitle2">{m.sender}</Typography>
            <Typography>{m.content}</Typography>
            <Typography variant="caption" color="textSecondary">
              {new Date(m.timestamp).toLocaleString('pl-PL')}
            </Typography>
          </Box>
        )) : (
          <Typography>Brak nowych wiadomości.</Typography>
        )}
      </Box>

      {/* Szybkie akcje */}
      <Box>
        <Button variant="contained" onClick={() => navigate('/addproperty')} sx={{ mr: 2 }}>
          Dodaj nieruchomość
        </Button>
        <Button variant="contained" onClick={() => navigate('/addleasing')} sx={{ mr: 2 }}>
          Dodaj wynajem
        </Button>
        <Button variant="contained" onClick={() => navigate('/addpayment')}>
          Dodaj płatność
        </Button>
      </Box>
    </Box>
  );
}
