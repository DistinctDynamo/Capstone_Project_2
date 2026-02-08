const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/user');
const Conversation = require('../models/conversation');
const Message = require('../models/message');

describe('Message Routes', () => {
  let user1Token, user1Id;
  let user2Token, user2Id;

  // Helper to register and get token
  const registerUser = async (userData) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: userData.username,
        email: userData.email,
        password: 'password123',
        first_name: userData.first_name,
        last_name: userData.last_name,
        user_type: 'player',
        date_of_birth: new Date('1995-01-15')
      });
    return res.body.data;
  };

  beforeEach(async () => {
    // Create two users for messaging tests
    const userData1 = await registerUser({
      username: 'msguser1',
      email: 'msguser1@example.com',
      first_name: 'Message',
      last_name: 'User1'
    });
    user1Token = userData1.token;
    user1Id = userData1.user.id;

    const userData2 = await registerUser({
      username: 'msguser2',
      email: 'msguser2@example.com',
      first_name: 'Message',
      last_name: 'User2'
    });
    user2Token = userData2.token;
    user2Id = userData2.user.id;
  });

  describe('POST /api/messages/conversations', () => {
    it('should create a direct conversation', async () => {
      const res = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          participantId: user2Id,
          type: 'direct'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.conversation.type).toBe('direct');
      expect(res.body.data.conversation.participants).toHaveLength(2);
    });

    it('should return existing conversation instead of creating duplicate', async () => {
      // Create first conversation
      await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user2Id, type: 'direct' });

      // Try to create the same conversation
      const res = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user2Id, type: 'direct' });

      expect(res.status).toBe(200);  // Returns existing, not 201
    });

    it('should create a group conversation', async () => {
      const user3 = await registerUser({
        username: 'msguser3',
        email: 'msguser3@example.com',
        first_name: 'Message',
        last_name: 'User3'
      });

      const res = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'group',
          name: 'Team Chat',
          participantIds: [user2Id, user3.user.id]
        });

      expect(res.status).toBe(201);
      expect(res.body.data.conversation.type).toBe('group');
      expect(res.body.data.conversation.name).toBe('Team Chat');
      expect(res.body.data.conversation.participants).toHaveLength(3);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/messages/conversations')
        .send({ participantId: user2Id, type: 'direct' });

      expect(res.status).toBe(401);
    });

    it('should fail with non-existent participant', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: fakeId, type: 'direct' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/messages/conversations', () => {
    beforeEach(async () => {
      // Create a conversation
      await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user2Id, type: 'direct' });
    });

    it('should get user conversations', async () => {
      const res = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.conversations).toBeInstanceOf(Array);
      expect(res.body.data.conversations.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/messages/conversations');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/messages/conversations/:id', () => {
    let conversationId;

    beforeEach(async () => {
      const convRes = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user2Id, type: 'direct' });
      conversationId = convRes.body.data.conversation._id;
    });

    it('should get conversation with messages', async () => {
      const res = await request(app)
        .get(`/api/messages/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.conversation).toBeDefined();
      expect(res.body.data.messages).toBeInstanceOf(Array);
    });

    it('should fail for non-participant', async () => {
      const user3 = await registerUser({
        username: 'outsider',
        email: 'outsider@example.com',
        first_name: 'Outside',
        last_name: 'User'
      });

      const res = await request(app)
        .get(`/api/messages/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${user3.token}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent conversation', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/messages/conversations/${fakeId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/messages/conversations/:id/messages', () => {
    let conversationId;

    beforeEach(async () => {
      const convRes = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user2Id, type: 'direct' });
      conversationId = convRes.body.data.conversation._id;
    });

    it('should send a message', async () => {
      const res = await request(app)
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Hello, how are you?' });

      expect(res.status).toBe(201);
      expect(res.body.data.message.content).toBe('Hello, how are you?');
      expect(res.body.data.message.sender._id).toBe(user1Id);
    });

    it('should receive message as other user', async () => {
      // User1 sends message
      await request(app)
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Hello from user1!' });

      // User2 gets conversation and sees message
      const res = await request(app)
        .get(`/api/messages/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.messages.length).toBeGreaterThan(0);
      expect(res.body.data.messages.some(m => m.content === 'Hello from user1!')).toBe(true);
    });

    it('should fail without content', async () => {
      const res = await request(app)
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should fail for non-participant', async () => {
      const user3 = await registerUser({
        username: 'intruder',
        email: 'intruder@example.com',
        first_name: 'Intruder',
        last_name: 'User'
      });

      const res = await request(app)
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${user3.token}`)
        .send({ content: 'Sneaky message!' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/messages/:messageId', () => {
    let conversationId;
    let messageId;

    beforeEach(async () => {
      const convRes = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user2Id, type: 'direct' });
      conversationId = convRes.body.data.conversation._id;

      const msgRes = await request(app)
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Message to delete' });
      messageId = msgRes.body.data.message._id;
    });

    it('should delete own message', async () => {
      const res = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });

    it('should fail to delete another user message', async () => {
      const res = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/messages/conversations/:id/poll', () => {
    let conversationId;

    beforeEach(async () => {
      const convRes = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user2Id, type: 'direct' });
      conversationId = convRes.body.data.conversation._id;
    });

    it('should poll for new messages', async () => {
      // Send a message first
      await request(app)
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'New message!' });

      const res = await request(app)
        .get(`/api/messages/conversations/${conversationId}/poll`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.messages).toBeInstanceOf(Array);
      expect(res.body.data.timestamp).toBeDefined();
    });
  });

  describe('PUT /api/messages/conversations/:id/leave', () => {
    it('should leave a group conversation', async () => {
      const user3 = await registerUser({
        username: 'leaveuser',
        email: 'leaveuser@example.com',
        first_name: 'Leave',
        last_name: 'User'
      });

      // Create group conversation
      const convRes = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'group',
          name: 'Test Group',
          participantIds: [user2Id, user3.user.id]
        });

      const res = await request(app)
        .put(`/api/messages/conversations/${convRes.body.data.conversation._id}/leave`)
        .set('Authorization', `Bearer ${user3.token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Left');
    });

    it('should fail to leave a direct conversation', async () => {
      const convRes = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user2Id, type: 'direct' });

      const res = await request(app)
        .put(`/api/messages/conversations/${convRes.body.data.conversation._id}/leave`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(400);
    });
  });
});
