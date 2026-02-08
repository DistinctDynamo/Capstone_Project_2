import api from './axios';

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  checkEmail: async (email) => {
    const response = await api.get('/auth/check-email', { params: { email } });
    return response.data;
  },

  checkUsername: async (username) => {
    const response = await api.get('/auth/check-username', { params: { username } });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  heartbeat: async () => {
    const response = await api.post('/auth/heartbeat');
    return response.data;
  },
};
