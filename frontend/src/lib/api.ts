import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
