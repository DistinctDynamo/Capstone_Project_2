import api from './axios';

export const usersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  updateStats: async (id, stats) => {
    const response = await api.put(`/users/${id}/stats`, stats);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  search: async (query, filters = {}) => {
    const response = await api.get('/users/search', { params: { q: query, ...filters } });
    return response.data;
  },

  // FIFA-style player stats
  getPlayerStats: async (id) => {
    const response = await api.get(`/users/${id}/player-stats`);
    return response.data;
  },

  updatePlayerStats: async (attributes) => {
    const response = await api.put('/users/me/player-stats', attributes);
    return response.data;
  },
};
