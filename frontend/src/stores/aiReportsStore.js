import { create } from 'zustand';
import { api, apiError } from '../lib/api';

export const useAIReportsStore = create((set) => ({
  report: null,
  warning: null,

  isLoading: false,
  error: null,

  clear: () => set({ report: null, warning: null, error: null }),

  /**
   * Create AI Report (teacher)
   * POST /api/ai-reports
   * body: { workId }
   */
  createReport: async (workId) => {
    set({ isLoading: true, error: null, warning: null });
    try {
      const { data } = await api.post('/api/ai-reports', { workId });
      set({
        report: data.report,
        warning: data.warning ?? null,
        isLoading: false,
      });
      return data.report;
    } catch (err) {
      console.log(err);
      set({
        isLoading: false,
        error: apiError(err, 'Create AI report failed'),
      });
      return null;
    }
  },

  /**
   * Get AI Report by WorkId
   * GET /api/ai-reports/by-work/:workId
   */
  fetchByWorkId: async (workId) => {
    set({ isLoading: true, error: null, warning: null });
    try {
      const { data } = await api.get(`/api/ai-reports/by-work/${workId}`);
      set({ report: data.report, isLoading: false });
      return data.report;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Fetch AI report failed') });
      return null;
    }
  },
}));