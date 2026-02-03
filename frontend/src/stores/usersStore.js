import { create } from 'zustand';
import { api, apiError } from '../lib/api';

export const useUsersStore = create((set, get) => ({
  users: [],

  q: '',
  role: '',

  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),

  setFilters: (next) => set((s) => ({ ...s, ...next })),

  /**
   * List Users (admin)
   * GET /api/users?q=&role=
   */
  fetchUsers: async () => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { q, role } = get();
      const params = {};
      if (q) params.q = q;
      if (role) params.role = role;

      const { data } = await api.get('/api/users', { params });
      set({ users: data.users, isLoading: false });
      return data.users;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Fetch users failed') });
      return [];
    }
  },

  /**
   * Update User Role (admin)
   * PUT /api/users/:id/role
   * body: { role }
   */
  updateUserRole: async (id, role) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { data } = await api.put(`/api/users/${id}/role`, { role });

      set((s) => ({
        users: s.users.map((u) => (u.id === id ? data.user : u)),
        isLoading: false,
        success: 'Role updated',
      }));

      return data.user;
    } catch (err) {
      set({ isLoading: false, error: apiError(err, 'Update role failed') });
      return null;
    }
  },
}));