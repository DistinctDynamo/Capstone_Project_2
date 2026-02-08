const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/user');
const Field = require('../models/field');
const Booking = require('../models/booking');

describe('Booking Routes', () => {
  let token;
  let userId;
  let fieldId;

  beforeEach(async () => {
    // Create user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'bookinguser',
        email: 'booking@example.com',
        password: 'password123',
        first_name: 'Booking',
        last_name: 'User',
        user_type: 'player',
        date_of_birth: new Date('1995-01-15')
      });
    token = userRes.body.data.token;
    userId = userRes.body.data.user.id;

    // Create a field
    const field = await Field.create({
      name: 'Test Soccer Field',
      description: 'A great field for soccer',
      address: {
        street: '123 Test St',
        city: 'Toronto',
        province: 'Ontario',
        postal_code: 'M1M 1M1'
      },
      field_type: 'outdoor',
      size: '11v11',
      amenities: ['parking', 'lighting'],
      operating_hours: {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '22:00' },
        saturday: { open: '08:00', close: '22:00' },
        sunday: { open: '08:00', close: '22:00' }
      },
      hourly_rate: 100
    });
    fieldId = field._id.toString();
  });

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          field: fieldId,
          date: tomorrow.toISOString(),
          start_time: '10:00',
          end_time: '12:00'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.duration_hours).toBe(2);
      expect(res.body.data.booking.total_price).toBe(200);
    });

    it('should fail with invalid field', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          field: fakeId,
          date: tomorrow.toISOString(),
          start_time: '10:00',
          end_time: '12:00'
        });

      expect(res.status).toBe(404);
    });

    it('should fail with conflicting booking', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Create first booking
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          field: fieldId,
          date: tomorrow.toISOString(),
          start_time: '10:00',
          end_time: '12:00'
        });

      // Try to create overlapping booking
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          field: fieldId,
          date: tomorrow.toISOString(),
          start_time: '11:00',
          end_time: '13:00'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already booked');
    });
  });

  describe('GET /api/bookings', () => {
    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await Booking.create({
        field: fieldId,
        user: userId,
        date: tomorrow,
        start_time: '10:00',
        end_time: '12:00',
        duration_hours: 2,
        total_price: 200,
        status: 'pending'
      });
    });

    it('should get user bookings', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.bookings).toBeInstanceOf(Array);
      expect(res.body.data.bookings.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .query({ status: 'pending' });

      expect(res.status).toBe(200);
      expect(res.body.data.bookings.every(b => b.status === 'pending')).toBe(true);
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    let bookingId;

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const booking = await Booking.create({
        field: fieldId,
        user: userId,
        date: tomorrow,
        start_time: '10:00',
        end_time: '12:00',
        duration_hours: 2,
        total_price: 200,
        status: 'pending'
      });
      bookingId = booking._id.toString();
    });

    it('should cancel a booking', async () => {
      const res = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Changed plans' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('cancelled');

      const getRes = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.body.data.booking.status).toBe('cancelled');
    });
  });
});
