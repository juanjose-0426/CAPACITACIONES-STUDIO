import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : window.location.origin);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Interceptor para inyectar automáticamente el token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globales (ej: token vencido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Helper para resolver URLs de archivos (videos con streaming HTTP 206 y PDFs)
export const getFileUrl = (urlOrPath) => {
  if (!urlOrPath) return '';
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  if (urlOrPath.startsWith('/uploads/')) {
    const filename = urlOrPath.replace('/uploads/', '');
    return `${API_BASE_URL}/api/contents/stream/${filename}`;
  }
  return `${API_BASE_URL}${urlOrPath.startsWith('/') ? '' : '/'}${urlOrPath}`;
};

export default api;
