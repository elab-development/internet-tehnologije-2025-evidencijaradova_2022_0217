import { create } from 'zustand';
import { api, apiError } from '../lib/api';

export const useAdminStatsStore = create((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),

  fetchStats: async () => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { data } = await api.get('/api/admin/stats');
      set({ stats: data, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Fetch stats failed') });
      return null;
    }
  },
}));