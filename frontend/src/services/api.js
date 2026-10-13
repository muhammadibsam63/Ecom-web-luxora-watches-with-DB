import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // send the HTTP-only auth cookie
  headers: { 'Content-Type': 'application/json' },
});

// Normalize error messages so UI code can just read err.message
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message || 'Something went wrong. Please try again.';
    const details = error.response?.data?.details;
    const status = error.response?.status;
    return Promise.reject({ message, details, status, raw: error });
  }
);

export default api;
