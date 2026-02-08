import api from './axios';

export const fieldsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/fields', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/fields/${id}`);
    return response.data;
  },

  getAvailability: async (id, date) => {
    const response = await api.get(`/fields/${id}/availability`, { params: { date } });
    return response.data;
  },

  getNearby: async (lat, lng, maxDistance) => {
    const response = await api.get('/fields/nearby', { params: { lat, lng, maxDistance } });
    return response.data;
  },
};

export const bookingsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  update: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  confirm: async (id) => {
    const response = await api.put(`/bookings/${id}/confirm`);
    return response.data;
  },

  cancel: async (id, reason) => {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
};
