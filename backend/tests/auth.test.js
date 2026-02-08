const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/user');

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      user_type: 'player',
      date_of_birth: new Date('1995-01-15')
    };

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe(validUser.username);
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'invalid-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      await User.create(validUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, username: 'different' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Email');
    });

    it('should fail with duplicate username', async () => {
      await User.create(validUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'different@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Username');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'logintest',
        email: 'login@example.com',
        password: 'password123',
        first_name: 'Login',
        last_name: 'Test',
        user_type: 'player',
        date_of_birth: new Date('1995-01-15')
      });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('login@example.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'metest',
          email: 'me@example.com',
          password: 'password123',
          first_name: 'Me',
          last_name: 'Test',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });
      token = res.body.data.token;
    });

    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('me@example.com');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/check-email', () => {
    beforeEach(async () => {
      await User.create({
        username: 'emailcheck',
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Email',
        last_name: 'Check',
        user_type: 'player',
        date_of_birth: new Date('1995-01-15')
      });
    });

    it('should return available true for new email', async () => {
      const res = await request(app)
        .get('/api/auth/check-email')
        .query({ email: 'new@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.data.available).toBe(true);
    });

    it('should return available false for existing email', async () => {
      const res = await request(app)
        .get('/api/auth/check-email')
        .query({ email: 'existing@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.data.available).toBe(false);
    });

    it('should fail without email parameter', async () => {
      const res = await request(app)
        .get('/api/auth/check-email');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/check-username', () => {
    beforeEach(async () => {
      await User.create({
        username: 'existinguser',
        email: 'user@example.com',
        password: 'password123',
        first_name: 'User',
        last_name: 'Existing',
        user_type: 'player',
        date_of_birth: new Date('1995-01-15')
      });
    });

    it('should return available true for new username', async () => {
      const res = await request(app)
        .get('/api/auth/check-username')
        .query({ username: 'newuser' });

      expect(res.status).toBe(200);
      expect(res.body.data.available).toBe(true);
    });

    it('should return available false for existing username', async () => {
      const res = await request(app)
        .get('/api/auth/check-username')
        .query({ username: 'existinguser' });

      expect(res.status).toBe(200);
      expect(res.body.data.available).toBe(false);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'pwdtest',
          email: 'pwd@example.com',
          password: 'oldpassword123',
          first_name: 'Pwd',
          last_name: 'Test',
          user_type: 'player',
          date_of_birth: new Date('1995-01-15')
        });
      token = res.body.data.token;
    });

    it('should change password successfully', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword456'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify can login with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'pwd@example.com',
          password: 'newpassword456'
        });

      expect(loginRes.status).toBe(200);
    });

    it('should fail with wrong current password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Current password is incorrect');
    });

    it('should fail with short new password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword123',
          newPassword: '123'
        });

      expect(res.status).toBe(400);
    });
  });
});
