import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import '../css/AddProperty.css';  // <-- import stylów

function AddProperty() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    area: '',
    property_type: 'flat',
    rooms: '',
    description: '',
    is_furnished: false,
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/properties/', formData);
      alert('Nieruchomość dodana!');
      navigate('/properties');
    } catch (error) {
      console.error('Błąd:', error.response?.data || error);
      alert('Błąd podczas dodawania nieruchomości!');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="add-property-form">
      <input
        type="text"
        name="name"
        placeholder="Nazwa"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="address"
        placeholder="Adres"
        value={formData.address}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="area"
        placeholder="Powierzchnia (m²)"
        value={formData.area}
        onChange={handleChange}
        required
      />

      <select
        name="property_type"
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
        placeholder="Liczba pokoi"
        value={formData.rooms}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Opis"
        value={formData.description}
        onChange={handleChange}
      />

      <div className="add-property-checkbox">
        <input
          type="checkbox"
          name="is_furnished"
          checked={formData.is_furnished}
          onChange={handleChange}
        />
        <label htmlFor="is_furnished">Wyposażone</label>
      </div>

      <button type="submit" className="add-property-button">
        Dodaj nieruchomość
      </button>
    </form>
  );
}

export default AddProperty;
