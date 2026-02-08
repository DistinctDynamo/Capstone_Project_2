import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8046/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout on 401 if:
    // 1. It's a 401 error
    // 2. It's not from auth endpoints (login/register should handle their own errors)
    // 3. We have a token (meaning we thought we were logged in)
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    const hasToken = localStorage.getItem('token');

    if (error.response?.status === 401 && !isAuthEndpoint && hasToken) {
      // Token is invalid/expired - clear it but don't force redirect
      // Let the app's auth state handle the redirect gracefully
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
