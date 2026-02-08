import api from './axios';

export const eventsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  update: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  expressInterest: async (id, status) => {
    const response = await api.post(`/events/${id}/interest`, { status });
    return response.data;
  },

  removeInterest: async (id) => {
    const response = await api.delete(`/events/${id}/interest`);
    return response.data;
  },

  // New join request system
  requestJoin: async (id, message = '') => {
    const response = await api.post(`/events/${id}/join`, { message });
    return response.data;
  },

  handleJoinRequest: async (eventId, requestId, status) => {
    const response = await api.put(`/events/${eventId}/requests/${requestId}`, { status });
    return response.data;
  },

  leaveEvent: async (eventId, userId) => {
    const response = await api.delete(`/events/${eventId}/participants/${userId}`);
    return response.data;
  },

  getMyEvents: async () => {
    const response = await api.get('/events/user/my-events');
    return response.data;
  },

  getAttending: async () => {
    const response = await api.get('/events/user/attending');
    return response.data;
  },
};
