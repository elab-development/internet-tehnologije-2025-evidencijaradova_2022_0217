import { create } from 'zustand';
import { api, apiError } from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,

  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),
  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),

  /**
   * Register
   * POST /api/auth/register
   * body: { fullName, email, password }
   */
  register: async (payload) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { data } = await api.post('/api/auth/register', payload);
      set({ user: data.user, isLoading: false, success: 'Registered' });
      return data.user;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Register failed') });
      return null;
    }
  },

  /**
   * Login
   * POST /api/auth/login
   * body: { email, password }
   */
  login: async (payload) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { data } = await api.post('/api/auth/login', payload);
      set({ user: data.user, isLoading: false, success: 'Logged in' });
      return data.user;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Login failed') });
      return null;
    }
  },

  /**
   * Logout
   * POST /api/auth/logout
   */
  logout: async () => {
    set({ isLoading: true, error: null, success: null });
    try {
      await api.post('/api/auth/logout');
      set({ user: null, isLoading: false, success: 'Logged out' });
      return true;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Logout failed') });
      return false;
    }
  },

  /**
   * Me (restore session)
   * GET /api/auth/me
   */
  me: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/api/auth/me');
      set({ user: data.user, isLoading: false });
      return data.user;
    } catch (err) {
      set({ user: null, isLoading: false });
      return null;
    }
  },
}));