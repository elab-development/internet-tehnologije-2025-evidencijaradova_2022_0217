import { create } from 'zustand';
import { api, apiError } from '../lib/api';

export const usePlagiarismReportsStore = create((set) => ({
  report: null,
  warning: null,

  isLoading: false,
  error: null,

  clear: () => set({ report: null, warning: null, error: null }),

  /**
   * Create Plagiarism Report (teacher)
   * POST /api/plagiarism-reports
   * body: { workId }
   */
  createReport: async (workId) => {
    set({ isLoading: true, error: null, warning: null });
    try {
      const { data } = await api.post('/api/plagiarism-reports', { workId });
      set({
        report: data.report,
        warning: data.warning ?? null,
        isLoading: false,
      });
      return data.report;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Create report failed') });
      return null;
    }
  },

  /**
   * Get Plagiarism Report by WorkId
   * GET /api/plagiarism-reports/by-work/:workId
   */
  fetchByWorkId: async (workId) => {
    set({ isLoading: true, error: null, warning: null });
    try {
      const { data } = await api.get(
        `/api/plagiarism-reports/by-work/${workId}`,
      );
      set({ report: data.report, isLoading: false });
      return data.report;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Fetch report failed') });
      return null;
    }
  },
}));