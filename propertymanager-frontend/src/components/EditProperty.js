import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/EditProperty.css';

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    area: '',
    property_type: 'flat',
    rooms: '',
    description: '',
    is_furnished: false,
    is_currently_rented: false,
    will_be_rented: false,
  });

  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await api.get(`/properties/${id}/`);
        setFormData(response.data);
      } catch (error) {
        console.error('Błąd ładowania nieruchomości:', error);
      }
    }
    fetchProperty();
  }, [id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.patch(`/properties/${id}/`, formData);
      alert('Zmiany zapisane!');
      navigate('/properties');
    } catch (error) {
      console.error('Błąd podczas aktualizacji!', error);
      alert('Błąd podczas aktualizacji!');
    }
  };

  return (
    <div className="edit-property-container">
      <h2 className="edit-property-title">Edytuj nieruchomość</h2>
      <form onSubmit={handleSubmit} className="edit-property-form">
        <input
          type="text"
          name="name"
          className="form-control"
          placeholder="Nazwa"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          className="form-control"
          placeholder="Adres"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="area"
          className="form-control"
          placeholder="Powierzchnia (m²)"
          value={formData.area}
          onChange={handleChange}
          required
        />
        <select
          name="property_type"
          className="form-control"
          value={formData.property_type}
          onChange={handleChange}
          required
        >
          <option value="flat">Mieszkanie</option>
          <option value="house">Dom</option>
          <option value="commercial">Lokal usługowy</option>
        </select>
        <input
          type="number"
          name="rooms"
          className="form-control"
          placeholder="Liczba pokoi"
          value={formData.rooms}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          className="form-control"
          placeholder="Opis"
          value={formData.description}
          onChange={handleChange}
        />
        <div className="checkbox-container">
          <input
            type="checkbox"
            name="is_furnished"
            checked={formData.is_furnished}
            onChange={handleChange}
          />
          <label className="checkbox-label">Wyposażone</label>
        </div>
        <p className="readonly-info">
          <strong>Aktualnie wynajmowane:</strong> {formData.is_currently_rented ? 'Tak' : 'Nie'}
        </p>
        {!formData.is_currently_rented && (
          <p className="readonly-info">
            <strong>W przyszłości wynajmowane:</strong> {formData.will_be_rented ? 'Tak' : 'Nie'}
          </p>
        )}
        <button type="submit" className="edit-property-submit">
          Zapisz zmiany
        </button>
      </form>
    </div>
  );
}
