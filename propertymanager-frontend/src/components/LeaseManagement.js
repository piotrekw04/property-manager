import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

function LeaseManagement() {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaseType, setLeaseType] = useState('owned');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeases();
  }, [leaseType]);

  const fetchLeases = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/leases/?type=${leaseType}`);
      setLeases(response.data);
    } catch (error) {
      console.error('Błąd:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditLease = (id) => {
    navigate(`/editlease/${id}`);
  };

  const handleDeleteLease = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten wynajem?")) return;
    try {
      await api.delete(`/leases/${id}/`);
      fetchLeases();
    } catch (error) {
      console.error('Błąd usuwania wynajmu:', error);
    }
  };

  const handleDownloadAgreement = async (id) => {
    try {
      const response = await api.get(`/leases/${id}/agreement/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `umowa_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Błąd pobierania umowy:', error);
      alert('Nie udało się pobrać umowy. Upewnij się, że jesteś zalogowany.');
    }
  };

  const handleSignLease = async (id) => {
    if (!window.confirm("Na pewno chcesz podpisać tę umowę?")) return;
    try {
      await api.post(`/leases/${id}/sign/`);
      alert('Umowa została podpisana i aktywowana.');
      fetchLeases();
    } catch (error) {
      console.error('Błąd podpisywania umowy:', error);
      alert(error.response?.data?.error || 'Nie udało się podpisać umowy.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Oczekuje na potwierdzenie';
      case 'waiting_signature':
        return 'Oczekuje na podpisanie umowy';
      case 'active':
        return 'Aktywny';
      default:
        return status;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2>Zarządzanie wynajmem</h2>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setLeaseType('owned')} disabled={leaseType === 'owned'}>
          Wynajmuję
        </button>
        <button
          onClick={() => setLeaseType('rented')}
          disabled={leaseType === 'rented'}
          style={{ marginLeft: 10 }}
        >
          Wynajmuję od kogoś
        </button>
      </div>

      {leaseType === 'owned' && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => navigate('/addleasing')}>Dodaj nowy wynajem</button>
        </div>
      )}

      {leases.length > 0 ? leases.map(lease => (
        <div
          key={lease.id}
          style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}
        >
          <div>
            <strong>Nieruchomość:</strong> {lease.property_info?.name} ({lease.property_info?.address})
          </div>

          {leaseType === 'owned' ? (
            <div>
              <strong>Najemca:</strong> {lease.tenant_info?.first_name} {lease.tenant_info?.last_name} ({lease.tenant_info?.username})
            </div>
          ) : (
            <div>
              <strong>Właściciel:</strong> {lease.owner_info?.first_name} {lease.owner_info?.last_name} ({lease.owner_info?.username})
            </div>
          )}

          <div>
            <strong>Okres:</strong> {formatDate(lease.start_date)} → {formatDate(lease.end_date)}
          </div>
          <div><strong>Czynsz:</strong> {lease.rent_amount} zł</div>
          <div><strong>Status:</strong> {translateStatus(lease.status)}</div>

          <div style={{ marginTop: 10 }}>
            {/* Pobierz umowę */}
            <button onClick={() => handleDownloadAgreement(lease.id)} style={{ marginRight: 10 }}>
              Pobierz umowę
            </button>

            {/* Podpisz umowę dla najemcy */}
            {leaseType === 'rented' && lease.status === 'waiting_signature' && (
              <button onClick={() => handleSignLease(lease.id)} style={{ marginRight: 10 }}>
                Podpisz umowę
              </button>
            )}

            {/* Tylko dla właściciela: edycja i usuwanie */}
            {leaseType === 'owned' && (
              <>
                <button onClick={() => handleEditLease(lease.id)}>Edytuj</button>
                <button onClick={() => handleDeleteLease(lease.id)} style={{ marginLeft: 10 }}>
                  Usuń
                </button>
              </>
            )}
          </div>
        </div>
      )) : (
        <p>Brak wynajmów do wyświetlenia.</p>
      )}
    </div>
  );
}

export default LeaseManagement;
