/**
 * API Service
 * Centralized API calls for the seat booking application
 */

import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: '/api'
});

// Add auth token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're on the login page or if this is a login/change-password request
      // Let the login/change-password components handle their own error display
      const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/change-password');
      
      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
  changePassword: (passwords) => API.post('/auth/change-password', passwords)
};

// Seats API calls
export const seatsAPI = {
  getAll: () => API.get('/seats'),
  book: (seatId) => API.post(`/seats/book/${seatId}`),
  release: () => API.post('/seats/release')
};

export default API;
