const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/user');

describe('User Routes', () => {
  let token;
  let userId;

  // Helper to register and get token
  const registerUser = async (userData) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: userData.username || 'testuser',
        email: userData.email || 'test@example.com',
        password: userData.password || 'password123',
        first_name: userData.first_name || 'Test',
        last_name: userData.last_name || 'User',
        user_type: userData.user_type || 'player',
        date_of_birth: new Date('1995-01-15')
      });
    return res.body.data;
  };

  beforeEach(async () => {
    // Create primary test user with authentication
    const userData = await registerUser({
      username: 'primaryuser',
      email: 'primary@example.com',
      first_name: 'Primary',
      last_name: 'User'
    });
    token = userData.token;
    userId = userData.user.id;
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create additional users for testing
      await registerUser({
        username: 'player1',
        email: 'player1@example.com',
        first_name: 'Player',
        last_name: 'One',
        user_type: 'player'
      });
      await registerUser({
        username: 'organizer1',
        email: 'organizer1@example.com',
        first_name: 'Organizer',
        last_name: 'One',
        user_type: 'organizer'
      });
    });

    it('should get all users with authentication', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeInstanceOf(Array);
      expect(res.body.data.users.length).toBeGreaterThan(0);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter users by user_type', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .query({ user_type: 'organizer' });

      expect(res.status).toBe(200);
      expect(res.body.data.users.every(u => u.user_type === 'organizer')).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/search', () => {
    beforeEach(async () => {
      await registerUser({
        username: 'midfielder_john',
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Smith',
        user_type: 'player'
      });
    });

    it('should search users by query', async () => {
      const res = await request(app)
        .get('/api/users/search')
        .set('Authorization', `Bearer ${token}`)
        .query({ q: 'John' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeDefined();
    });

    it('should fail without search query', async () => {
      const res = await request(app)
        .get('/api/users/search')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Search query');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID (public route)', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user._id).toBe(userId);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/users/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/users/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update own profile', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'I love soccer!',
          location: 'Toronto'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.bio).toBe('I love soccer!');
      expect(res.body.data.user.location).toBe('Toronto');
    });

    it('should fail to update another user profile', async () => {
      const otherUser = await registerUser({
        username: 'otheruser',
        email: 'other@example.com'
      });

      const res = await request(app)
        .put(`/api/users/${otherUser.user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ bio: 'Hacked!' });

      expect(res.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .send({ bio: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/users/:id/stats', () => {
    it('should update own stats', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}/stats`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          games_played: 10,
          goals: 5,
          assists: 3
        });

      expect(res.status).toBe(200);
      expect(res.body.data.stats.games_played).toBe(10);
      expect(res.body.data.stats.goals).toBe(5);
      expect(res.body.data.stats.assists).toBe(3);
    });

    it('should fail to update another user stats', async () => {
      const otherUser = await registerUser({
        username: 'statsuser',
        email: 'stats@example.com'
      });

      const res = await request(app)
        .put(`/api/users/${otherUser.user.id}/stats`)
        .set('Authorization', `Bearer ${token}`)
        .send({ goals: 100 });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/users/:id/player-stats', () => {
    it('should get player FIFA-style stats', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}/player-stats`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.player_attributes).toBeDefined();
      expect(res.body.data.overall_rating).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/users/${fakeId}/player-stats`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/users/me/player-stats', () => {
    it('should update player attributes', async () => {
      const res = await request(app)
        .put('/api/users/me/player-stats')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pace: 85,
          shooting: 70,
          passing: 80,
          dribbling: 75,
          defending: 60,
          physical: 78
        });

      expect(res.status).toBe(200);
      expect(res.body.data.player_attributes.pace).toBe(85);
      expect(res.body.data.player_attributes.shooting).toBe(70);
    });

    it('should clamp values to 1-99 range', async () => {
      const res = await request(app)
        .put('/api/users/me/player-stats')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pace: 150,  // Should be clamped to 99
          shooting: -5  // Should be clamped to 1
        });

      expect(res.status).toBe(200);
      expect(res.body.data.player_attributes.pace).toBe(99);
      expect(res.body.data.player_attributes.shooting).toBe(1);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .put('/api/users/me/player-stats')
        .send({ pace: 80 });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should deactivate own account', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deactivated');

      // Verify user is deactivated
      const user = await User.findById(userId);
      expect(user.is_active).toBe(false);
    });

    it('should fail to delete another user account', async () => {
      const otherUser = await registerUser({
        username: 'deletetest',
        email: 'delete@example.com'
      });

      const res = await request(app)
        .delete(`/api/users/${otherUser.user.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
