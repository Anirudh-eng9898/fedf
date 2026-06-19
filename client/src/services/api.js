import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Dynamically handle GitHub Codespaces port forwarding URLs
if (typeof window !== 'undefined' && window.location.hostname.includes('.app.github.dev')) {
  const match = window.location.hostname.match(/-(\d+)\.app\.github\.dev/);
  if (match) {
    baseURL = `https://${window.location.hostname.replace(`-${match[1]}`, '-5000')}/api`;
  }
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('wellness_auth');
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch { /* ignore */ }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errCode = error.response?.data?.error;
      if (errCode === 'TOKEN_EXPIRED' || errCode === 'INVALID_TOKEN') {
        localStorage.removeItem('wellness_auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
