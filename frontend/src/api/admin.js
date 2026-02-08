import api from './axios';

export const adminAPI = {
  // Dashboard stats
  getStats: () => api.get('/admin/stats'),

  // Events management
  getPendingEvents: () => api.get('/admin/events/pending'),
  approveEvent: (id) => api.put(`/admin/events/${id}/approve`),
  rejectEvent: (id, reason) => api.put(`/admin/events/${id}/reject`, { reason }),

  // Teams management
  getPendingTeams: () => api.get('/admin/teams/pending'),
  approveTeam: (id) => api.put(`/admin/teams/${id}/approve`),
  rejectTeam: (id, reason) => api.put(`/admin/teams/${id}/reject`, { reason }),

  // User management
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserRole: (id, user_type) => api.put(`/admin/users/${id}/role`, { user_type }),
  toggleUserBan: (id) => api.put(`/admin/users/${id}/ban`),
};
