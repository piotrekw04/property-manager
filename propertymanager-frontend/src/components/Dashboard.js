import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/Dashboard.css';

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
    <Box className="dashboard-container">
      <Grid container spacing={2} className="dashboard-stats">
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Nieruchomości</Typography>
              <Typography variant="h4">{stats.total_properties}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Aktywne umowy</Typography>
              <Typography variant="h4">{stats.active_leases}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Oczekujące</Typography>
              <Typography variant="h4">{stats.pending_leases}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Płatności (7 dni)</Typography>
              <Typography variant="h4">
                {upcomingTenant.length + upcomingOwner.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box className="dashboard-upcoming">
        <Typography variant="h6" className="dashboard-section-title">
          Nadchodzące płatności
        </Typography>

        <Typography variant="subtitle1" className="dashboard-section-title">
          Do zapłacenia
        </Typography>
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
                  <TableCell>
                    {new Date(p.date).toLocaleDateString('pl-PL')}
                  </TableCell>
                  <TableCell>{p.property}</TableCell>
                  <TableCell>{p.counterparty}</TableCell>
                  <TableCell align="right">{p.amount} zł</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2">
            Brak płatności do zapłacenia.
          </Typography>
        )}

        <Typography variant="subtitle1" className="dashboard-section-title">
          Do odebrania
        </Typography>
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
                  <TableCell>
                    {new Date(p.date).toLocaleDateString('pl-PL')}
                  </TableCell>
                  <TableCell>{p.property}</TableCell>
                  <TableCell>{p.counterparty}</TableCell>
                  <TableCell align="right">{p.amount} zł</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2">
            Brak płatności do odebrania.
          </Typography>
        )}
      </Box>

      <Box className="dashboard-messages">
        <Typography variant="h6" className="dashboard-section-title">
          Ostatnie wiadomości
        </Typography>
        {messages.length > 0 ? (
          messages.map((m, i) => (
            <Box key={i} className="message-card">
              <Typography variant="subtitle2">{m.sender}</Typography>
              <Typography>{m.content}</Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(m.timestamp).toLocaleString('pl-PL')}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography>Brak nowych wiadomości.</Typography>
        )}
      </Box>

      <Box className="dashboard-actions">
        <Button
          variant="contained"
          onClick={() => navigate('/addproperty')}
          className="action-button"
        >
          Dodaj nieruchomość
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/addleasing')}
          className="action-button"
        >
          Dodaj wynajem
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/addpayment')}
          className="action-button"
        >
          Dodaj płatność
        </Button>
      </Box>
    </Box>
  );
}
