const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/user');
const Notification = require('../models/notification');

describe('Notification Routes', () => {
  let token;
  let userId;

  // Helper to register and get token
  const registerUser = async (userData) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: userData.username || 'testuser',
        email: userData.email || 'test@example.com',
        password: 'password123',
        first_name: userData.first_name || 'Test',
        last_name: userData.last_name || 'User',
        user_type: userData.user_type || 'player',
        date_of_birth: new Date('1995-01-15')
      });
    return res.body.data;
  };

  // Helper to create notification directly in database
  const createNotification = async (userId, overrides = {}) => {
    return await Notification.create({
      user: userId,
      type: overrides.type || 'team_invite',
      title: overrides.title || 'Test Notification',
      message: overrides.message || 'This is a test notification',
      link: overrides.link || '/test',
      read: overrides.read || false,
      ...overrides
    });
  };

  beforeEach(async () => {
    const userData = await registerUser({
      username: 'notifuser',
      email: 'notif@example.com',
      first_name: 'Notif',
      last_name: 'User'
    });
    token = userData.token;
    userId = userData.user.id;
  });

  describe('GET /api/notifications', () => {
    beforeEach(async () => {
      // Create some notifications
      await createNotification(userId, { title: 'Notification 1' });
      await createNotification(userId, { title: 'Notification 2', read: true });
      await createNotification(userId, { title: 'Notification 3' });
    });

    it('should get all notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications).toBeInstanceOf(Array);
      expect(res.body.data.notifications.length).toBe(3);
      expect(res.body.data.unreadCount).toBeDefined();
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter unread notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .query({ unread: 'true' });

      expect(res.status).toBe(200);
      expect(res.body.data.notifications.every(n => n.read === false)).toBe(true);
      expect(res.body.data.notifications.length).toBe(2);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.data.notifications.length).toBe(2);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.total).toBe(3);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/notifications');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    beforeEach(async () => {
      await createNotification(userId, { read: false });
      await createNotification(userId, { read: false });
      await createNotification(userId, { read: true });
    });

    it('should get unread count', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(2);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    let notificationId;

    beforeEach(async () => {
      const notification = await createNotification(userId, { read: false });
      notificationId = notification._id.toString();
    });

    it('should mark notification as read', async () => {
      const res = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notification.read).toBe(true);
      expect(res.body.data.notification.read_at).toBeDefined();
    });

    it('should fail for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should fail for other user notification', async () => {
      const otherUser = await registerUser({
        username: 'othernotif',
        email: 'othernotif@example.com'
      });
      const otherNotif = await createNotification(otherUser.user.id);

      const res = await request(app)
        .put(`/api/notifications/${otherNotif._id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);  // Returns 404 as user doesn't own it
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    beforeEach(async () => {
      await createNotification(userId, { read: false });
      await createNotification(userId, { read: false });
      await createNotification(userId, { read: false });
    });

    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('All notifications marked as read');

      // Verify all are read
      const checkRes = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);
      expect(checkRes.body.data.count).toBe(0);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let notificationId;

    beforeEach(async () => {
      const notification = await createNotification(userId);
      notificationId = notification._id.toString();
    });

    it('should delete a notification', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');

      // Verify deleted
      const notification = await Notification.findById(notificationId);
      expect(notification).toBeNull();
    });

    it('should fail to delete other user notification', async () => {
      const otherUser = await registerUser({
        username: 'deleteother',
        email: 'deleteother@example.com'
      });
      const otherNotif = await createNotification(otherUser.user.id);

      const res = await request(app)
        .delete(`/api/notifications/${otherNotif._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/notifications', () => {
    beforeEach(async () => {
      await createNotification(userId);
      await createNotification(userId);
      await createNotification(userId);
    });

    it('should clear all notifications', async () => {
      const res = await request(app)
        .delete('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('cleared');

      // Verify all cleared
      const checkRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);
      expect(checkRes.body.data.notifications.length).toBe(0);
    });
  });
});
