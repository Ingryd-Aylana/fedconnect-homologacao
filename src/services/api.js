// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bigcorp-backend.onrender.com/',
});

// Intercepta todas as requisições Axios
api.interceptors.request.use(
  (config) => {
    // Obtém o token do localStorage
    const token = localStorage.getItem('accessToken');

    // Se o token existir, adicione-o ao cabeçalho Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;