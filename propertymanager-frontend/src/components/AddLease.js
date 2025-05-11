import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/AddLease.css';

function AddLease() {
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    property: '',
    tenant: '',
    start_date: '',
    end_date: '',
    rent_amount: '',
    payment_due_day: 10,
    agreement_signed_in_person: false,
  });
  const [searchTenantUsername, setSearchTenantUsername] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get('/properties/');
        setProperties(response.data);
      } catch (error) {
        console.error('Błąd ładowania nieruchomości:', error);
      }
    };
    fetchProperties();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTenantSearch = async () => {
    try {
      const res = await api.get(`/user/search/?username=${searchTenantUsername}`);
      setSearchResult(res.data);
      setFormData(prev => ({ ...prev, tenant: res.data.id }));
      setError('');
    } catch (error) {
      setSearchResult(null);
      setFormData(prev => ({ ...prev, tenant: '' }));
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Błąd wyszukiwania użytkownika.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tenant) {
      setError('Wybierz najemcę.');
      return;
    }
    try {
      await api.post('/leases/', formData);
      alert('Wynajem został dodany!');
      navigate('/leases');
    } catch (error) {
      console.error('Błąd dodawania wynajmu:', error);
      if (error.response?.data) {
        const firstError = Object.values(error.response.data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError('Coś poszło nie tak.');
      }
    }
  };

  return (
    <div className="add-lease-container">
      <h2>Dodaj wynajem</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <select name="property" value={formData.property} onChange={handleChange} required>
          <option value="">Wybierz nieruchomość</option>
          {properties.map(prop => (
            <option key={prop.id} value={prop.id}>
              {prop.name} ({prop.address})
            </option>
          ))}
        </select>

        <div className="tenant-search-container">
          <input
            type="text"
            value={searchTenantUsername}
            onChange={e => setSearchTenantUsername(e.target.value)}
            placeholder="Wyszukaj nazwę użytkownika najemcy"
          />
          <button
            type="button"
            onClick={handleTenantSearch}
            className="search-button"
          >
            Szukaj najemcy
          </button>
        </div>

        {searchResult && (
          <div className="search-result">
            Wybrano najemcę: <strong>{searchResult.username}</strong>
          </div>
        )}

        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="rent_amount"
          value={formData.rent_amount}
          onChange={handleChange}
          placeholder="Czynsz miesięczny"
          required
        />

        <input
          type="number"
          name="payment_due_day"
          value={formData.payment_due_day}
          onChange={handleChange}
          placeholder="Dzień płatności (1-31)"
          min="1"
          max="31"
          required
        />

        <label className="agreement-label">
          <input
            type="checkbox"
            name="agreement_signed_in_person"
            checked={formData.agreement_signed_in_person}
            onChange={handleChange}
          />
          Umowa została podpisana na miejscu
        </label>

        <button type="submit" className="submit-button">
          Dodaj wynajem
        </button>
      </form>
    </div>
  );
}

export default AddLease;
