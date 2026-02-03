import { create } from 'zustand';
import { api, apiError } from '../lib/api';

export const useWorksStore = create((set, get) => ({
  works: [],
  work: null,

  sort: 'submittedAt:desc',
  studentId: '',
  q: '',

  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),
  clearWork: () => set({ work: null }),
  setQuery: (next) => set((s) => ({ ...s, ...next })),

  /**
   * Create Work (student)
   * POST /api/works
   * multipart/form-data: title, subject, description?, file
   */
  createWork: async ({ title, subject, description, file }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('subject', subject);
      if (description) fd.append('description', description);
      fd.append('file', file);

      const { data } = await api.post('/api/works', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      set((s) => ({
        works: [data.work, ...s.works],
        isLoading: false,
        success: 'Work created',
      }));

      return data.work;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Create work failed') });
      return null;
    }
  },

  /**
   * List Works
   * GET /api/works?sort=&studentId=&q=
   */
  fetchWorks: async () => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { sort, studentId, q } = get();
      const params = {};
      if (sort) params.sort = sort;
      if (studentId) params.studentId = studentId;
      if (q) params.q = q;

      const { data } = await api.get('/api/works', { params });
      set({ works: data.works, isLoading: false });
      return data.works;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Fetch works failed') });
      return [];
    }
  },

  /**
   * Get Work By Id
   * GET /api/works/:id
   */
  fetchWorkById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/api/works/${id}`);
      set({ work: data.work, isLoading: false });
      return data.work;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Fetch work failed') });
      return null;
    }
  },

  /**
   * Update Work (student, only pending_review)
   * PUT /api/works/:id
   * body: { title?, subject?, description?, fileUrl? }
   *
   * NOTE: trenutno backend update prima JSON (ne upload).
   * Ako budeš hteo update sa fajlom, dodamo multipart putanju.
   */
  updateWork: async (id, payload) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { data } = await api.put(`/api/works/${id}`, payload);

      set((s) => ({
        works: s.works.map((w) => (w.id === id ? data.work : w)),
        work: s.work?.id === id ? data.work : s.work,
        isLoading: false,
        success: 'Work updated',
      }));

      return data.work;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Update work failed') });
      return null;
    }
  },

  /**
   * Delete Work (student, only pending_review)
   * DELETE /api/works/:id
   */
  deleteWork: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      await api.delete(`/api/works/${id}`);
      set((s) => ({
        works: s.works.filter((w) => w.id !== id),
        work: s.work?.id === id ? null : s.work,
        isLoading: false,
        success: 'Work deleted',
      }));
      return true;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Delete work failed') });
      return false;
    }
  },
}));