import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/Activate.css';

export default function Activate() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Aktywuję konto...');

  useEffect(() => {
    api.get(`/user/activate/${uidb64}/${token}/`)
      .then(res => {
        setMessage(res.data.detail);
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch(err => {
        setMessage(err.response?.data?.detail || 'Błąd aktywacji.');
      });
  }, [uidb64, token, navigate]);

  return (
    <div className="activate-container">
      <h2>Aktywacja konta</h2>
      <p>{message}</p>
    </div>
  );
}
