// src/lib/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
});

export function apiError(err, fallback = 'Server error') {
  return err?.response?.data?.message || err?.message || fallback;
}