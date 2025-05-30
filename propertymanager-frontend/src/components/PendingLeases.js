import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import '../css/PendingLeases.css';

export default function PendingLeases() {
  const [pendingLeases, setPendingLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingLeases();
  }, []);

  const fetchPendingLeases = async () => {
    try {
      const response = await api.get('/leases/pending/');
      setPendingLeases(response.data);
    } catch (error) {
      console.error('Błąd ładowania oczekujących najemów:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (leaseId) => {
    try {
      await api.post(`/leases/confirm/${leaseId}/`);
      alert('Najem zaakceptowany!');
      fetchPendingLeases();
    } catch (error) {
      console.error('Błąd akceptacji najmu:', error);
    }
  };

  const handleReject = async (leaseId) => {
    if (!window.confirm('Czy na pewno chcesz odrzucić ten najem?')) return;
    try {
      await api.post(`/leases/reject/${leaseId}/`);
      alert('Najem odrzucony.');
      fetchPendingLeases();
    } catch (error) {
      console.error('Błąd odrzucenia najmu:', error);
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Oczekuje na potwierdzenie';
      case 'active':
        return 'Aktywny';
      case 'waiting_signature':
        return 'Oczekuje na podpisanie umowy';
      default:
        return status;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pending-leases-container">
      <h2>Oczekujące wynajmy</h2>

      {pendingLeases.length === 0 ? (
        <p>Brak oczekujących wynajmów do potwierdzenia.</p>
      ) : (
        pendingLeases.map(lease => (
          <div key={lease.id} className="pending-lease-item">
            <div className="pending-lease-field">
              <strong>Nieruchomość:</strong> {lease.property_info.name} ({lease.property_info.address})
            </div>
            <div className="pending-lease-field">
              <strong>Właściciel:</strong> {lease.owner_info.first_name} {lease.owner_info.last_name} ({lease.owner_info.username})
            </div>
            <div className="pending-lease-field">
              <strong>Okres najmu:</strong> {lease.start_date} ➔ {lease.end_date}
            </div>
            <div className="pending-lease-field">
              <strong>Miesięczny czynsz:</strong> {lease.rent_amount} zł
            </div>
            <div className="pending-lease-field">
              <strong>Podpisano na miejscu:</strong> {lease.agreement_signed_in_person ? "Tak" : "Nie"}
            </div>
            <div className="pending-lease-field">
              <strong>Status:</strong> {translateStatus(lease.status)}
            </div>

            <div className="pending-lease-actions">
              <button
                className="confirm-button"
                onClick={() => handleConfirm(lease.id)}
              >
                Akceptuję
              </button>
              <button
                className="reject-button"
                onClick={() => handleReject(lease.id)}
              >
                Odrzucam
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
