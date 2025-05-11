import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function EditLease() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lease, setLease] = useState({
    start_date: '',
    end_date: '',
    rent_amount: '',
  });

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const response = await api.get(`/leases/${id}/`);
        setLease({
          start_date: response.data.start_date,
          end_date: response.data.end_date,
          rent_amount: response.data.rent_amount,
        });
      } catch (error) {
        console.error('Błąd ładowania wynajmu:', error);
      }
    };

    fetchLease();
  }, [id]);

  const handleChange = (e) => {
    setLease({ ...lease, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/leases/${id}/`, lease);
      alert('Wynajem został zaktualizowany!');
      navigate('/leases');
    } catch (error) {
      console.error('Błąd aktualizacji wynajmu:', error);
    }
  };

  return (
    <div>
      <h2>Edytuj wynajem</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          name="start_date"
          value={lease.start_date}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="end_date"
          value={lease.end_date}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="rent_amount"
          value={lease.rent_amount}
          onChange={handleChange}
          placeholder="Czynsz miesięczny"
          required
        />
        <button type="submit">Zapisz zmiany</button>
      </form>
    </div>
  );
}

export default EditLease;
