import api from './axios';

export const messagesAPI = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getConversation: async (id, params = {}) => {
    const response = await api.get(`/messages/conversations/${id}`, { params });
    return response.data;
  },

  createConversation: async (data) => {
    const response = await api.post('/messages/conversations', data);
    return response.data;
  },

  sendMessage: async (conversationId, content, messageType = 'text', attachments = []) => {
    const response = await api.post(`/messages/conversations/${conversationId}/messages`, {
      content,
      message_type: messageType,
      attachments,
    });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  pollMessages: async (conversationId, since) => {
    const response = await api.get(`/messages/conversations/${conversationId}/poll`, {
      params: { since },
    });
    return response.data;
  },

  leaveConversation: async (conversationId) => {
    const response = await api.put(`/messages/conversations/${conversationId}/leave`);
    return response.data;
  },
};
