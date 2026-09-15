import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const shouldEndSession = status === 401 || code === 'ACCOUNT_LOCKED';

    if (shouldEndSession) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-changed'));

      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        const destination = `${path}${window.location.search}`;
        const reason = code === 'ACCOUNT_LOCKED' ? '&reason=locked' : '';
        window.location.assign(`/login?from=${encodeURIComponent(destination)}${reason}`);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
