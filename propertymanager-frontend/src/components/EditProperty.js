import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function EditProperty() {
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
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}/`);
        setFormData(response.data);
      } catch (error) {
        console.error('Błąd ładowania nieruchomości:', error);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/properties/${id}/`, formData);
      alert('Zmiany zapisane!');
      navigate('/properties');
    } catch (error) {
      console.error('Błąd aktualizacji nieruchomości:', error);
      alert('Błąd podczas aktualizacji!');
    }
  };

  return (
    <div>
      <h2>Edytuj nieruchomość</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nazwa"
          required
        />
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Adres"
          required
        />
        <input
          type="number"
          name="area"
          value={formData.area}
          onChange={handleChange}
          placeholder="Powierzchnia (m²)"
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
          value={formData.rooms}
          onChange={handleChange}
          placeholder="Liczba pokoi"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Opis"
        />

        <label>
          <input
            type="checkbox"
            name="is_furnished"
            checked={formData.is_furnished}
            onChange={handleChange}
          />
          Wyposażone
        </label>

        <p>
          <strong>Aktualnie wynajmowane:</strong> {formData.is_currently_rented ? 'Tak' : 'Nie'}
        </p>
        { !formData.is_currently_rented && (
          <p>
            <strong>W przyszłości wynajmowane:</strong> {formData.will_be_rented ? 'Tak' : 'Nie'}
          </p>
        )}


        <button type="submit">Zapisz zmiany</button>
      </form>
    </div>
  );
}

export default EditProperty;
