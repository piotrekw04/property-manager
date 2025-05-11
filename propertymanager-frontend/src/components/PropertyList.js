import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import api from '../api'; // <-- Używamy naszego api, nie axiosa!!!!!!!

function PropertyList() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate();

    useEffect(() => {
        fetchProperties();
    }, [navigate]);

    const fetchProperties = async () => {
        try {
            const response = await api.get('/properties/');
            setProperties(response.data);
        } catch (error) {
            console.error('Błąd:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddPropertyClick = () => {
        navigate('/addproperty');
    };

    const handleEditPropertyClick = (id) => {
        navigate(`/editproperty/${id}`);
    };

    const handleDeletePropertyClick = async (id) => {
        if (window.confirm("Czy na pewno chcesz usunąć tę nieruchomość?")) {
            try {
                await api.delete(`/properties/${id}/`);
                fetchProperties(); // Po usunięciu odśwież listę
            } catch (error) {
                console.error('Błąd usuwania nieruchomości:', error);
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <h1>Lista nieruchomości</h1>
            <button onClick={handleAddPropertyClick}>Dodaj nieruchomość</button>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {properties.map(property => (
                    <li key={property.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
                        <h3>{property.name}</h3>
                        <p><strong>Adres:</strong> {property.address}</p>
                        <p><strong>Typ:</strong> {property.property_type === 'flat' ? 'Mieszkanie' : property.property_type === 'house' ? 'Dom' : 'Lokal usługowy'}</p>
                        <p><strong>Powierzchnia:</strong> {property.area} m²</p>
                        <p><strong>Liczba pokoi:</strong> {property.rooms}</p>
                        <p><strong>Wyposażone:</strong> {property.is_furnished ? 'Tak' : 'Nie'}</p>
                        <p><strong>Aktualnie wynajmowane:</strong> {property.is_currently_rented ? 'Tak' : 'Nie'}</p>
                        { !property.is_currently_rented && (
                        <p><strong>W przyszłości wynajmowane:</strong> {property.will_be_rented ? 'Tak' : 'Nie'}</p>
                        )}
                        { property.description && (
                            <p><strong>Opis:</strong> {property.description}</p>
                        )}
                        <button onClick={() => handleEditPropertyClick(property.id)}>Edytuj</button>
                        <button onClick={() => handleDeletePropertyClick(property.id)}>Usuń</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PropertyList;
