// healthcare-portal-frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Automatically attach auth token for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Optional: Handle global 401 (Unauthorized) responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token might be expired or invalid → handle logout or redirect
      localStorage.removeItem('token');
      window.location.href = '/login'; // redirect to login page
    }
    return Promise.reject(error);
  }
);

export default api;
