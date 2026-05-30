import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://invoicebackend-production-faa7.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to automatically inject the Bearer token
api.interceptors.request.use(
  (config) => {
    // We assume the token will be stored in localStorage under 'token'
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401s (Token Expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Show toast for error
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    toast.error(errorMessage);

    if (error.response?.status === 401) {
      // Don't redirect if we're trying to login or register
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      
      if (!isAuthRoute) {
        // Clear local storage and redirect to login if token is invalid/expired
        localStorage.removeItem('token');
        localStorage.removeItem('invoiceiq_user_v2'); // Keep naming consistent with authStore
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
