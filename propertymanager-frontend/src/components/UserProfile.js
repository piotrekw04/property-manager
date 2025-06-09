import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert, Avatar } from '@mui/material';
//import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/UserProfile.css';

export default function UserProfile() {
  //const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    avatar: null,
  });
  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/user/profile/');
        setProfile({
          username:     res.data.username,
          first_name:   res.data.first_name   || '',
          last_name:    res.data.last_name    || '',
          email:        res.data.email        || '',
          phone_number: res.data.phone_number || '',
          avatar:       res.data.avatar       || null,
        });
        if (res.data.avatar) setPreview(res.data.avatar);
      } catch {
        setMessage({ type: 'error', text: 'Błąd ładowania profilu' });
      }
    })();
  }, []);

  const handleFileChange = e => {
    const file = e.target.files[0];
    setProfile(p => ({ ...p, avatar: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('first_name',   profile.first_name);
    formData.append('last_name',    profile.last_name);
    formData.append('email',        profile.email);
    formData.append('phone_number', profile.phone_number);
    if (profile.avatar instanceof File) {
      formData.append('avatar', profile.avatar);
    }

    try {
      const res = await api.patch('/user/profile/', formData);
      setProfile({
        username:     res.data.username,
        first_name:   res.data.first_name   || '',
        last_name:    res.data.last_name    || '',
        email:        res.data.email        || '',
        phone_number: res.data.phone_number || '',
        avatar:       res.data.avatar       || null,
      });
      setPreview(res.data.avatar || null);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profil zaktualizowany!' });
    } catch {
      setMessage({ type: 'error', text: 'Błąd przy zapisie profilu' });
    }
  };

  return (
    <Box className="user-profile-container">
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {isEditing ? (
        <Box component="form" onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              mb: 2,
            }}
          >
            <Avatar src={preview} sx={{ width: 100, height: 100 }} />
            <Button
              type="button"
              variant="outlined"
              component="label"
              sx={{ mt: 1 }}
            >
              Zmień zdjęcie
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          <TextField
            label="Login"
            name="username"
            value={profile.username}
            fullWidth
            margin="normal"
            disabled
          />

          <TextField
            label="Imię"
            name="first_name"
            value={profile.first_name}
            onChange={e =>
              setProfile(p => ({ ...p, first_name: e.target.value }))
            }
            fullWidth
            margin="normal"
          />

          <TextField
            label="Nazwisko"
            name="last_name"
            value={profile.last_name}
            onChange={e =>
              setProfile(p => ({ ...p, last_name: e.target.value }))
            }
            fullWidth
            margin="normal"
          />

          <TextField
            label="E-mail"
            name="email"
            type="email"
            value={profile.email}
            onChange={e =>
              setProfile(p => ({ ...p, email: e.target.value }))
            }
            fullWidth
            margin="normal"
          />

          <TextField
            label="Telefon"
            name="phone_number"
            value={profile.phone_number}
            onChange={e =>
              setProfile(p => ({ ...p, phone_number: e.target.value }))
            }
            fullWidth
            margin="normal"
          />

          <Box className="user-profile-button-group">
            <Button type="submit" variant="contained" sx={{ mr: 2 }}>
              Zapisz zmiany
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setIsEditing(false)}
            >
              Anuluj
            </Button>
          </Box>
        </Box>
      ) : (
        <Box className="user-profile-view-container" sx={{ textAlign: 'center' }}>
          <Avatar src={preview} sx={{ width: 100, height: 100, mb: 2, mx: 'auto' }} />
          <TextField
            label="Login"
            value={profile.username}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="Imię"
            value={profile.first_name}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="Nazwisko"
            value={profile.last_name}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="E-mail"
            value={profile.email}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="Telefon"
            value={profile.phone_number}
            fullWidth
            margin="normal"
            disabled
          />
          <Box className="user-profile-button-group">
            <Button
              type="button"
              variant="contained"
              onClick={() => setIsEditing(true)}
              sx={{ mr: 2 }}
            >
              Edytuj profil
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
