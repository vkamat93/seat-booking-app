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

// Admin API calls
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  createUser: (userData) => API.post('/admin/users', userData),
  updateUser: (id, userData) => API.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  resetPassword: (id) => API.put(`/admin/users/${id}/reset-password`),
  getBookings: (params) => API.get('/admin/bookings', { params }),
  createManualBookings: (data) => API.post('/admin/bookings/manual', data),
  releaseBookings: (data) => API.post('/admin/bookings/release', data),
  getUserStats: (id, month) => API.get(`/admin/users/${id}/stats`, { params: { month } }),
  getFutureBookings: () => API.get('/admin/bookings/future'),
  getPerpetualSeats: () => API.get('/admin/bookings/perpetual'),
  createPerpetualBooking: (data) => API.post('/admin/bookings/perpetual', data),
  deletePerpetualBooking: (seatId) => API.delete(`/admin/bookings/perpetual/${seatId}`),
  getDbEnv: () => API.get('/admin/db-env'),
  switchDbEnv: (env) => API.post('/admin/db-env', { env })
};

export default API;
