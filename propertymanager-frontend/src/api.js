import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  } else {
    delete config.headers['Content-Type'];
  }
  return config;
});


api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('http://localhost:8000/api/token/refresh/', {
            refresh: refreshToken
          });

          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Błąd odświeżania tokena:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/login'; 
      }
    }

    return Promise.reject(error);
  }
);

export default api;
