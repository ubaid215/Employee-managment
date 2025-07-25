// src/services/api.js
import axios from 'axios';

// Configure axios defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // Important: This sends cookies with requests
});

// Axios response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      // You might want to emit an event or update global state here
      console.error('Authentication error - redirecting to login');
    }
    return Promise.reject(error);
  }
);

export default api;