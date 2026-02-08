const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/user');
const Classified = require('../models/classified');

describe('Classified Routes', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'classifieduser',
        email: 'classified@example.com',
        password: 'password123',
        first_name: 'Classified',
        last_name: 'User',
        user_type: 'player',
        date_of_birth: new Date('1995-01-15')
      });
    token = res.body.data.token;
    userId = res.body.data.user.id;
  });

  const validClassified = {
    title: 'Looking for Midfielder',
    classified_type: 'looking_for_players',
    description: 'Our team needs a skilled midfielder for weekend games',
    location: 'Scarborough',
    position_needed: 'midfielder',
    skill_level: 'intermediate'
  };

  describe('POST /api/classifieds', () => {
    it('should create a classified successfully', async () => {
      const res = await request(app)
        .post('/api/classifieds')
        .set('Authorization', `Bearer ${token}`)
        .send(validClassified);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.classified.title).toBe(validClassified.title);
      expect(res.body.data.classified.creator._id).toBe(userId);
    });

    it('should fail with invalid classified type', async () => {
      const res = await request(app)
        .post('/api/classifieds')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validClassified, classified_type: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/classifieds')
        .send(validClassified);

      expect(res.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/classifieds')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Only title' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/classifieds', () => {
    beforeEach(async () => {
      await Classified.create({
        ...validClassified,
        creator: userId
      });
    });

    it('should get all classifieds', async () => {
      const res = await request(app)
        .get('/api/classifieds');

      expect(res.status).toBe(200);
      expect(res.body.data.classifieds).toBeInstanceOf(Array);
      expect(res.body.data.classifieds.length).toBeGreaterThan(0);
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/classifieds')
        .query({ classified_type: 'looking_for_players' });

      expect(res.status).toBe(200);
      expect(res.body.data.classifieds.every(c => c.classified_type === 'looking_for_players')).toBe(true);
    });

    it('should filter by location', async () => {
      const res = await request(app)
        .get('/api/classifieds')
        .query({ location: 'Scarborough' });

      expect(res.status).toBe(200);
    });

    it('should filter by position needed', async () => {
      const res = await request(app)
        .get('/api/classifieds')
        .query({ position_needed: 'midfielder' });

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/classifieds/:id', () => {
    let classifiedId;

    beforeEach(async () => {
      const classified = await Classified.create({
        ...validClassified,
        creator: userId
      });
      classifiedId = classified._id.toString();
    });

    it('should get a single classified', async () => {
      const res = await request(app)
        .get(`/api/classifieds/${classifiedId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.classified._id).toBe(classifiedId);
    });

    it('should return 404 for non-existent classified', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/classifieds/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/classifieds/:id', () => {
    let classifiedId;

    beforeEach(async () => {
      const classified = await Classified.create({
        ...validClassified,
        creator: userId
      });
      classifiedId = classified._id.toString();
    });

    it('should update a classified', async () => {
      const res = await request(app)
        .put(`/api/classifieds/${classifiedId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.data.classified.title).toBe('Updated Title');
    });

    it('should fail if not creator', async () => {
      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'other',
          email: 'other@example.com',
          password: 'password123',
          first_name: 'Other',
          last_name: 'User',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });

      const res = await request(app)
        .put(`/api/classifieds/${classifiedId}`)
        .set('Authorization', `Bearer ${otherRes.body.data.token}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/classifieds/:id', () => {
    let classifiedId;

    beforeEach(async () => {
      const classified = await Classified.create({
        ...validClassified,
        creator: userId
      });
      classifiedId = classified._id.toString();
    });

    it('should delete a classified', async () => {
      const res = await request(app)
        .delete(`/api/classifieds/${classifiedId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/classifieds/${classifiedId}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('POST /api/classifieds/:id/respond', () => {
    let classifiedId;
    let responderToken;

    beforeEach(async () => {
      const classified = await Classified.create({
        ...validClassified,
        creator: userId
      });
      classifiedId = classified._id.toString();

      const responderRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'responder',
          email: 'responder@example.com',
          password: 'password123',
          first_name: 'Responder',
          last_name: 'User',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });
      responderToken = responderRes.body.data.token;
    });

    it('should respond to a classified', async () => {
      const res = await request(app)
        .post(`/api/classifieds/${classifiedId}/respond`)
        .set('Authorization', `Bearer ${responderToken}`)
        .send({ message: 'I am interested in joining!' });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('Response sent');
    });

    it('should fail to respond twice', async () => {
      await request(app)
        .post(`/api/classifieds/${classifiedId}/respond`)
        .set('Authorization', `Bearer ${responderToken}`)
        .send({ message: 'First response' });

      const res = await request(app)
        .post(`/api/classifieds/${classifiedId}/respond`)
        .set('Authorization', `Bearer ${responderToken}`)
        .send({ message: 'Second response' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already responded');
    });

    it('should fail without message', async () => {
      const res = await request(app)
        .post(`/api/classifieds/${classifiedId}/respond`)
        .set('Authorization', `Bearer ${responderToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/classifieds/:id/mark-filled', () => {
    let classifiedId;

    beforeEach(async () => {
      const classified = await Classified.create({
        ...validClassified,
        creator: userId
      });
      classifiedId = classified._id.toString();
    });

    it('should mark classified as filled', async () => {
      const res = await request(app)
        .put(`/api/classifieds/${classifiedId}/mark-filled`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/classifieds/${classifiedId}`);
      expect(getRes.body.data.classified.status).toBe('filled');
    });

    it('should fail if not creator', async () => {
      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'notcreator',
          email: 'notcreator@example.com',
          password: 'password123',
          first_name: 'Not',
          last_name: 'Creator',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });

      const res = await request(app)
        .put(`/api/classifieds/${classifiedId}/mark-filled`)
        .set('Authorization', `Bearer ${otherRes.body.data.token}`);

      expect(res.status).toBe(403);
    });
  });
});
