import api from './axios';

export const classifiedsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/classifieds', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/classifieds/${id}`);
    return response.data;
  },

  create: async (classifiedData) => {
    const response = await api.post('/classifieds', classifiedData);
    return response.data;
  },

  update: async (id, classifiedData) => {
    const response = await api.put(`/classifieds/${id}`, classifiedData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/classifieds/${id}`);
    return response.data;
  },

  respond: async (id, message) => {
    const response = await api.post(`/classifieds/${id}/respond`, { message });
    return response.data;
  },

  markFilled: async (id) => {
    const response = await api.put(`/classifieds/${id}/mark-filled`);
    return response.data;
  },

  getMyClassifieds: async () => {
    const response = await api.get('/classifieds/user/my-classifieds');
    return response.data;
  },
};
