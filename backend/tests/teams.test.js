const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/user');
const Team = require('../models/teams');
const Conversation = require('../models/conversation');
const Message = require('../models/message');

describe('Team Routes', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'teamuser',
        email: 'team@example.com',
        password: 'password123',
        first_name: 'Team',
        last_name: 'User',
        user_type: 'player',
        date_of_birth: new Date('1995-01-15')
      });
    token = res.body.data.token;
    userId = res.body.data.user.id;
  });

  const validTeam = {
    team_name: 'Toronto FC Fans',
    description: 'A friendly team for TFC fans',
    location: 'Toronto',
    skill_level: 'intermediate',
    approval_status: 'approved'
  };

  describe('POST /api/teams', () => {
    it('should create a team successfully', async () => {
      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send(validTeam);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.team.team_name).toBe(validTeam.team_name);
      expect(res.body.data.team.owner._id).toBe(userId);
      expect(res.body.data.team.members.length).toBe(1);
    });

    it('should fail if user already owns a team', async () => {
      await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send(validTeam);

      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validTeam, team_name: 'Another Team' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already own');
    });

    it('should fail with duplicate team name', async () => {
      await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send(validTeam);

      // Create another user
      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'otherteam',
          email: 'otherteam@example.com',
          password: 'password123',
          first_name: 'Other',
          last_name: 'Team',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });

      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${otherRes.body.data.token}`)
        .send(validTeam);

      expect(res.status).toBe(400);
    });

    it('should fail with missing team name', async () => {
      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No name' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/teams', () => {
    beforeEach(async () => {
      await Team.create({
        ...validTeam,
        owner: userId,
        members: [{ user: userId, role: 'owner' }]
      });
    });

    it('should get all teams', async () => {
      const res = await request(app)
        .get('/api/teams');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.teams).toBeInstanceOf(Array);
    });

    it('should filter by recruiting status', async () => {
      const res = await request(app)
        .get('/api/teams')
        .query({ is_recruiting: 'true' });

      expect(res.status).toBe(200);
    });

    it('should filter by skill level', async () => {
      const res = await request(app)
        .get('/api/teams')
        .query({ skill_level: 'intermediate' });

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/teams/:id', () => {
    let teamId;

    beforeEach(async () => {
      const team = await Team.create({
        ...validTeam,
        owner: userId,
        members: [{ user: userId, role: 'owner' }]
      });
      teamId = team._id.toString();
    });

    it('should get a single team', async () => {
      const res = await request(app)
        .get(`/api/teams/${teamId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.team._id).toBe(teamId);
    });

    it('should return 404 for non-existent team', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/teams/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/teams/:id', () => {
    let teamId;

    beforeEach(async () => {
      const team = await Team.create({
        ...validTeam,
        owner: userId,
        members: [{ user: userId, role: 'owner' }]
      });
      teamId = team._id.toString();
    });

    it('should update team as owner', async () => {
      const res = await request(app)
        .put(`/api/teams/${teamId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Updated description' });

      expect(res.status).toBe(200);
      expect(res.body.data.team.description).toBe('Updated description');
    });

    it('should fail if not owner/captain', async () => {
      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'randomplayer',
          email: 'random@example.com',
          password: 'password123',
          first_name: 'Random',
          last_name: 'Player',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });

      const res = await request(app)
        .put(`/api/teams/${teamId}`)
        .set('Authorization', `Bearer ${otherRes.body.data.token}`)
        .send({ description: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/teams/:id/apply', () => {
    let teamId;
    let otherToken;

    beforeEach(async () => {
      const team = await Team.create({
        ...validTeam,
        owner: userId,
        members: [{ user: userId, role: 'owner' }],
        is_recruiting: true
      });
      teamId = team._id.toString();

      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'applicant',
          email: 'applicant@example.com',
          password: 'password123',
          first_name: 'Applicant',
          last_name: 'User',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });
      otherToken = otherRes.body.data.token;
    });

    it('should apply to join a team', async () => {
      const res = await request(app)
        .post(`/api/teams/${teamId}/apply`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ message: 'I want to join!' });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('Application submitted');
    });

    it('should fail to apply twice', async () => {
      await request(app)
        .post(`/api/teams/${teamId}/apply`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ message: 'First application' });

      const res = await request(app)
        .post(`/api/teams/${teamId}/apply`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ message: 'Second application' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already applied');
    });

    it('should fail if team is not recruiting', async () => {
      await Team.findByIdAndUpdate(teamId, { is_recruiting: false });

      const res = await request(app)
        .post(`/api/teams/${teamId}/apply`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ message: 'Please?' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('not currently recruiting');
    });
  });

  describe('PUT /api/teams/:id/applications/:applicationId', () => {
    let teamId;
    let applicationId;
    let applicantId;

    beforeEach(async () => {
      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'appuser',
          email: 'appuser@example.com',
          password: 'password123',
          first_name: 'App',
          last_name: 'User',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });
      applicantId = otherRes.body.data.user.id;

      const team = await Team.create({
        ...validTeam,
        owner: userId,
        members: [{ user: userId, role: 'owner' }],
        is_recruiting: true,
        applications: [{
          user: applicantId,
          message: 'Let me join!',
          status: 'pending'
        }]
      });
      teamId = team._id.toString();
      applicationId = team.applications[0]._id.toString();
    });

    it('should accept application', async () => {
      const res = await request(app)
        .put(`/api/teams/${teamId}/applications/${applicationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('accepted');

      // Verify member was added
      const teamRes = await request(app)
        .get(`/api/teams/${teamId}`);
      expect(teamRes.body.data.team.members.length).toBe(2);
    });

    it('should reject application', async () => {
      const res = await request(app)
        .put(`/api/teams/${teamId}/applications/${applicationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'rejected' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('rejected');

      // Verify member was not added
      const teamRes = await request(app)
        .get(`/api/teams/${teamId}`);
      expect(teamRes.body.data.team.members.length).toBe(1);
    });
  });

  describe('DELETE /api/teams/:id/members/:memberId', () => {
    let teamId;
    let memberId;
    let memberToken;

    beforeEach(async () => {
      const memberRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'member',
          email: 'member@example.com',
          password: 'password123',
          first_name: 'Member',
          last_name: 'User',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });
      memberId = memberRes.body.data.user.id;
      memberToken = memberRes.body.data.token;

      const team = await Team.create({
        ...validTeam,
        owner: userId,
        members: [
          { user: userId, role: 'owner' },
          { user: memberId, role: 'member' }
        ]
      });
      teamId = team._id.toString();

      await User.findByIdAndUpdate(memberId, { team: teamId, team_role: 'member' });
    });

    it('should allow member to leave team', async () => {
      const res = await request(app)
        .delete(`/api/teams/${teamId}/members/${memberId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('left');
    });

    it('should allow owner to remove member', async () => {
      const res = await request(app)
        .delete(`/api/teams/${teamId}/members/${memberId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('removed');
    });

    it('should not allow removing owner', async () => {
      const res = await request(app)
        .delete(`/api/teams/${teamId}/members/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('owner');
    });
  });

  describe('DELETE /api/teams/:id', () => {
    let teamId;

    beforeEach(async () => {
      const team = await Team.create({
        ...validTeam,
        owner: userId,
        members: [{ user: userId, role: 'owner' }]
      });
      teamId = team._id.toString();
    });

    it('should delete team as owner', async () => {
      const res = await request(app)
        .delete(`/api/teams/${teamId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/teams/${teamId}`);
      expect(getRes.status).toBe(404);
    });

    it('should fail if not owner', async () => {
      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'notowner',
          email: 'notowner@example.com',
          password: 'password123',
          first_name: 'Not',
          last_name: 'Owner',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });

      const res = await request(app)
        .delete(`/api/teams/${teamId}`)
        .set('Authorization', `Bearer ${otherRes.body.data.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Team Chat Integration', () => {
    it('should create team chat when team is created', async () => {
      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send(validTeam);

      expect(res.status).toBe(201);
      const teamId = res.body.data.team._id;

      // Check that team chat was created
      const conversation = await Conversation.findOne({ team: teamId, type: 'team' });
      expect(conversation).not.toBeNull();
      expect(conversation.participants).toHaveLength(1);
      expect(conversation.participants[0].toString()).toBe(userId);
      expect(conversation.name).toContain(validTeam.team_name);
    });

    it('should add user to team chat when application is accepted', async () => {
      // Create team
      const teamRes = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validTeam, is_recruiting: true });

      const teamId = teamRes.body.data.team._id;

      // Create applicant
      const applicantRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'chatapplicant',
          email: 'chatapplicant@example.com',
          password: 'password123',
          first_name: 'Chat',
          last_name: 'Applicant',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });
      const applicantId = applicantRes.body.data.user.id;
      const applicantToken = applicantRes.body.data.token;

      // Apply to team
      await request(app)
        .post(`/api/teams/${teamId}/apply`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({ message: 'Want to join!' });

      // Get application ID
      const team = await Team.findById(teamId);
      const applicationId = team.applications[0]._id.toString();

      // Accept application
      const acceptRes = await request(app)
        .put(`/api/teams/${teamId}/applications/${applicationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'accepted' });

      expect(acceptRes.status).toBe(200);

      // Check that user was added to team chat
      const conversation = await Conversation.findOne({ team: teamId, type: 'team' });
      expect(conversation.participants).toHaveLength(2);
      expect(conversation.participants.map(p => p.toString())).toContain(applicantId);

      // Check that system message was created
      const messages = await Message.find({ conversation: conversation._id, message_type: 'system' });
      expect(messages.length).toBeGreaterThan(0);
      expect(messages.some(m => m.content.includes('joined'))).toBe(true);
    });

    it('should remove user from team chat when member leaves', async () => {
      // Create team
      const teamRes = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validTeam, team_name: 'Leave Chat Team' });

      const teamId = teamRes.body.data.team._id;

      // Create and add member
      const memberRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'chatmember',
          email: 'chatmember@example.com',
          password: 'password123',
          first_name: 'Chat',
          last_name: 'Member',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });
      const memberId = memberRes.body.data.user.id;
      const memberToken = memberRes.body.data.token;

      // Add member directly to team
      await Team.findByIdAndUpdate(teamId, {
        $push: { members: { user: memberId, role: 'member', joined_at: new Date() } }
      });
      await User.findByIdAndUpdate(memberId, { team: teamId, team_role: 'member' });

      // Add member to team chat
      await Conversation.findOneAndUpdate(
        { team: teamId, type: 'team' },
        { $push: { participants: memberId } }
      );

      // Member leaves team
      const leaveRes = await request(app)
        .delete(`/api/teams/${teamId}/members/${memberId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(leaveRes.status).toBe(200);

      // Check that user was removed from team chat
      const conversation = await Conversation.findOne({ team: teamId, type: 'team' });
      expect(conversation.participants.map(p => p.toString())).not.toContain(memberId);

      // Check that system message was created
      const messages = await Message.find({ conversation: conversation._id, message_type: 'system' });
      expect(messages.some(m => m.content.includes('left'))).toBe(true);
    });

    it('should record team history when member leaves', async () => {
      // Create team
      const teamRes = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validTeam, team_name: 'History Test Team' });

      const teamId = teamRes.body.data.team._id;

      // Create and add member
      const memberRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'historymember',
          email: 'historymember@example.com',
          password: 'password123',
          first_name: 'History',
          last_name: 'Member',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });
      const memberId = memberRes.body.data.user.id;
      const memberToken = memberRes.body.data.token;

      // Add member directly to team
      const joinDate = new Date();
      await Team.findByIdAndUpdate(teamId, {
        $push: { members: { user: memberId, role: 'member', joined_at: joinDate } }
      });
      await User.findByIdAndUpdate(memberId, { team: teamId, team_role: 'member' });

      // Member leaves team
      await request(app)
        .delete(`/api/teams/${teamId}/members/${memberId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      // Check team history
      const user = await User.findById(memberId);
      expect(user.team_history).toHaveLength(1);
      expect(user.team_history[0].team_name).toBe('History Test Team');
      expect(user.team_history[0].role).toBe('member');
      expect(user.team_history[0].left_at).toBeDefined();
    });
  });
});
