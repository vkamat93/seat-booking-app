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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me')
};

// Seats API calls
export const seatsAPI = {
  getAll: () => API.get('/seats'),
  book: (seatId) => API.post(`/seats/book/${seatId}`),
  release: () => API.post('/seats/release')
};

export default API;
