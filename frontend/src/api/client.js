import axios from 'axios';

// Cookies (credentials) are required because the JWT lives in an HTTP-only cookie.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export default api;
