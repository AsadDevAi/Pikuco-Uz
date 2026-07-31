import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'https://pikuco-uz.onrender.com/api';
export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
    try {
      const token = await (window as any).Clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Clerk token error:', e);
    }
  }
  return config;
});

export default api;
