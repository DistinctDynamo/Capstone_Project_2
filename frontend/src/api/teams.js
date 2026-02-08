import api from './axios';

export const teamsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/teams', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  create: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  update: async (id, teamData) => {
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },

  apply: async (id, message) => {
    const response = await api.post(`/teams/${id}/apply`, { message });
    return response.data;
  },

  handleApplication: async (teamId, applicationId, status) => {
    const response = await api.put(`/teams/${teamId}/applications/${applicationId}`, { status });
    return response.data;
  },

  invite: async (teamId, userId) => {
    const response = await api.post(`/teams/${teamId}/invite`, { userId });
    return response.data;
  },

  respondToInvitation: async (teamId, invitationId, status) => {
    const response = await api.put(`/teams/${teamId}/invitations/${invitationId}`, { status });
    return response.data;
  },

  updateMemberRole: async (teamId, memberId, role) => {
    const response = await api.put(`/teams/${teamId}/members/${memberId}/role`, { role });
    return response.data;
  },

  removeMember: async (teamId, memberId) => {
    const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
    return response.data;
  },

  getMyTeam: async () => {
    const response = await api.get('/teams/user/my-team');
    return response.data;
  },

  getInvitations: async () => {
    const response = await api.get('/teams/user/invitations');
    return response.data;
  },
};
