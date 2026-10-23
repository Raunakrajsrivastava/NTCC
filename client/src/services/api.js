import axios from 'axios';

const TOKEN_KEY = 'arch_advisor_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ─── Request Interceptor — Attach JWT token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Handle errors uniformly ───────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    // Handle expired / invalid tokens — clear auth and redirect to login
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Avoid redirect loops if already on /login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const formattedError = {
      message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred',
      status: status || 500,
      details: error.response?.data || null,
    };
    return Promise.reject(formattedError);
  }
);

export default api;
