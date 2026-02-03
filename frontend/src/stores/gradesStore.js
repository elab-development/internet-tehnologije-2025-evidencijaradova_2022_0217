import { create } from 'zustand';
import { api, apiError } from '../lib/api';

export const useGradesStore = create((set, get) => ({
  grade: null,

  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),
  clearGrade: () => set({ grade: null }),

  /**
   * Create Grade (teacher)
   * POST /api/grades
   * body: { workId, gradeValue, comment? }
   */
  createGrade: async (payload) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { data } = await api.post('/api/grades', payload);
      set({ grade: data.grade, isLoading: false, success: 'Grade created' });
      return data.grade;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Create grade failed') });
      return null;
    }
  },

  /**
   * Get Grade by WorkId
   * GET /api/grades/by-work/:workId
   */
  fetchGradeByWorkId: async (workId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/api/grades/by-work/${workId}`);
      set({ grade: data.grade, isLoading: false });
      return data.grade;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Fetch grade failed') });
      return null;
    }
  },

  /**
   * Update Grade (teacher, only owner)
   * PUT /api/grades/:id
   * body: { gradeValue?, comment? }
   */
  updateGrade: async (id, payload) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { data } = await api.put(`/api/grades/${id}`, payload);
      set({ grade: data.grade, isLoading: false, success: 'Grade updated' });
      return data.grade;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Update grade failed') });
      return null;
    }
  },

  /**
   * Delete Grade (teacher, only owner)
   * DELETE /api/grades/:id
   */
  deleteGrade: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      await api.delete(`/api/grades/${id}`);
      set({ grade: null, isLoading: false, success: 'Grade deleted' });
      return true;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Delete grade failed') });
      return false;
    }
  },
}));