const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/user');
const Team = require('../models/teams');
const Event = require('../models/events');
const Notification = require('../models/notification');

describe('Admin Routes', () => {
  let adminToken;
  let adminId;
  let regularToken;
  let regularId;

  // Helper to register and get token
  const registerUser = async (userData) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: userData.username,
        email: userData.email,
        password: 'password123',
        first_name: userData.first_name || 'Test',
        last_name: userData.last_name || 'User',
        user_type: userData.user_type || 'player',
        date_of_birth: new Date('1995-01-15')
      });
    return res.body.data;
  };

  beforeEach(async () => {
    // Create admin user
    const adminData = await registerUser({
      username: 'adminuser',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      user_type: 'player'  // Will be upgraded to admin
    });
    adminToken = adminData.token;
    adminId = adminData.user.id;

    // Upgrade to admin directly in database
    await User.findByIdAndUpdate(adminId, { user_type: 'admin' });

    // Re-login to get updated token with admin role
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    adminToken = loginRes.body.data.token;

    // Create regular user
    const regularData = await registerUser({
      username: 'regularuser',
      email: 'regular@example.com',
      first_name: 'Regular',
      last_name: 'User'
    });
    regularToken = regularData.token;
    regularId = regularData.user.id;
  });

  describe('GET /api/admin/stats', () => {
    it('should get dashboard stats as admin', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.users.total).toBeGreaterThan(0);
      expect(res.body.data.teams).toBeDefined();
      expect(res.body.data.events).toBeDefined();
    });

    it('should fail for non-admin user', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/admin/stats');

      expect(res.status).toBe(401);
    });
  });

  describe('Event Approval', () => {
    let pendingEventId;
    let eventCreatorId;

    beforeEach(async () => {
      // Create user who will create the event
      const eventCreator = await registerUser({
        username: 'eventcreator',
        email: 'eventcreator@example.com',
        first_name: 'Event',
        last_name: 'Creator'
      });
      eventCreatorId = eventCreator.user.id;

      // Create pending event
      const event = await Event.create({
        title: 'Pending Event',
        description: 'Event awaiting approval',
        event_type: 'pickup_game',
        creator: eventCreatorId,
        location: {
          name: 'Test Field',
          address: '123 Test St',
          city: 'Toronto'
        },
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        start_time: '14:00',
        end_time: '16:00',
        approval_status: 'pending'
      });
      pendingEventId = event._id.toString();
    });

    describe('GET /api/admin/events/pending', () => {
      it('should get pending events', async () => {
        const res = await request(app)
          .get('/api/admin/events/pending')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.events).toBeInstanceOf(Array);
        expect(res.body.data.events.some(e => e._id === pendingEventId)).toBe(true);
      });
    });

    describe('PUT /api/admin/events/:id/approve', () => {
      it('should approve an event', async () => {
        const res = await request(app)
          .put(`/api/admin/events/${pendingEventId}/approve`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.event.approval_status).toBe('approved');
        expect(res.body.data.event.approved_by).toBe(adminId);

        // Verify notification was created
        const notification = await Notification.findOne({
          user: eventCreatorId,
          type: 'event_approved'
        });
        expect(notification).toBeTruthy();
      });

      it('should return 404 for non-existent event', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
          .put(`/api/admin/events/${fakeId}/approve`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
      });
    });

    describe('PUT /api/admin/events/:id/reject', () => {
      it('should reject an event with reason', async () => {
        const res = await request(app)
          .put(`/api/admin/events/${pendingEventId}/reject`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ reason: 'Inappropriate content' });

        expect(res.status).toBe(200);
        expect(res.body.data.event.approval_status).toBe('rejected');
        expect(res.body.data.event.rejection_reason).toBe('Inappropriate content');
      });

      it('should fail without rejection reason', async () => {
        const res = await request(app)
          .put(`/api/admin/events/${pendingEventId}/reject`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('reason');
      });
    });
  });

  describe('Team Approval', () => {
    let pendingTeamId;
    let teamOwnerId;

    beforeEach(async () => {
      // Create user who will own the team
      const teamOwner = await registerUser({
        username: 'teamowner',
        email: 'teamowner@example.com',
        first_name: 'Team',
        last_name: 'Owner'
      });
      teamOwnerId = teamOwner.user.id;

      // Create pending team
      const team = await Team.create({
        team_name: 'Pending Team',
        description: 'Team awaiting approval',
        owner: teamOwnerId,
        members: [{ user: teamOwnerId, role: 'owner' }],
        approval_status: 'pending'
      });
      pendingTeamId = team._id.toString();
    });

    describe('GET /api/admin/teams/pending', () => {
      it('should get pending teams', async () => {
        const res = await request(app)
          .get('/api/admin/teams/pending')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.teams).toBeInstanceOf(Array);
        expect(res.body.data.teams.some(t => t._id === pendingTeamId)).toBe(true);
      });
    });

    describe('PUT /api/admin/teams/:id/approve', () => {
      it('should approve a team', async () => {
        const res = await request(app)
          .put(`/api/admin/teams/${pendingTeamId}/approve`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.team.approval_status).toBe('approved');

        // Verify notification was created
        const notification = await Notification.findOne({
          user: teamOwnerId,
          type: 'team_approved'
        });
        expect(notification).toBeTruthy();
      });
    });

    describe('PUT /api/admin/teams/:id/reject', () => {
      it('should reject a team with reason', async () => {
        const res = await request(app)
          .put(`/api/admin/teams/${pendingTeamId}/reject`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ reason: 'Duplicate team name' });

        expect(res.status).toBe(200);
        expect(res.body.data.team.approval_status).toBe('rejected');
        expect(res.body.data.team.rejection_reason).toBe('Duplicate team name');
      });
    });
  });

  describe('User Management', () => {
    describe('GET /api/admin/users', () => {
      it('should get all users', async () => {
        const res = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.users).toBeInstanceOf(Array);
        expect(res.body.data.users.length).toBeGreaterThan(0);
        expect(res.body.data.pagination).toBeDefined();
      });

      it('should filter by user_type', async () => {
        const res = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ user_type: 'admin' });

        expect(res.status).toBe(200);
        expect(res.body.data.users.every(u => u.user_type === 'admin')).toBe(true);
      });

      it('should filter by is_active', async () => {
        const res = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ is_active: 'true' });

        expect(res.status).toBe(200);
        expect(res.body.data.users.every(u => u.is_active === true)).toBe(true);
      });
    });

    describe('PUT /api/admin/users/:id/role', () => {
      it('should change user role', async () => {
        const res = await request(app)
          .put(`/api/admin/users/${regularId}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ user_type: 'organizer' });

        expect(res.status).toBe(200);
        expect(res.body.data.user.user_type).toBe('organizer');
      });

      it('should fail with invalid role', async () => {
        const res = await request(app)
          .put(`/api/admin/users/${regularId}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ user_type: 'superadmin' });

        expect(res.status).toBe(400);
      });

      it('should return 404 for non-existent user', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
          .put(`/api/admin/users/${fakeId}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ user_type: 'organizer' });

        expect(res.status).toBe(404);
      });
    });

    describe('PUT /api/admin/users/:id/ban', () => {
      it('should ban a user', async () => {
        const res = await request(app)
          .put(`/api/admin/users/${regularId}/ban`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.user.is_active).toBe(false);
        expect(res.body.message).toContain('banned');
      });

      it('should unban a user', async () => {
        // First ban
        await request(app)
          .put(`/api/admin/users/${regularId}/ban`)
          .set('Authorization', `Bearer ${adminToken}`);

        // Then unban
        const res = await request(app)
          .put(`/api/admin/users/${regularId}/ban`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.user.is_active).toBe(true);
        expect(res.body.message).toContain('unbanned');
      });
    });
  });
});
