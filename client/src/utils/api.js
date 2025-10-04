import axios from 'axios';

const api = axios.create({
 // baseURL: 'http://localhost:5000/api',
 baseURL: 'https://odoo-expense-app-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Yeh function har request ke saath token ko automatically attach kar dega
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;