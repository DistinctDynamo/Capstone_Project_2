const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Field = require('../models/field');

describe('Field Routes', () => {
  const validField = {
    name: 'Downsview Sports Complex',
    description: 'Premium outdoor soccer facility with excellent turf',
    address: {
      street: '1750 Sheppard Ave W',
      city: 'Toronto',
      province: 'Ontario',
      postal_code: 'M3L 1Y3'
    },
    field_type: 'turf',
    size: '11v11',
    amenities: ['parking', 'changing_rooms', 'lighting', 'seating'],
    operating_hours: {
      monday: { open: '06:00', close: '23:00' },
      tuesday: { open: '06:00', close: '23:00' },
      wednesday: { open: '06:00', close: '23:00' },
      thursday: { open: '06:00', close: '23:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '07:00', close: '22:00' },
      sunday: { open: '07:00', close: '22:00' }
    },
    hourly_rate: 150
  };

  beforeEach(async () => {
    await Field.create(validField);
  });

  describe('GET /api/fields', () => {
    it('should get all fields', async () => {
      const res = await request(app)
        .get('/api/fields');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fields).toBeInstanceOf(Array);
      expect(res.body.data.fields.length).toBeGreaterThan(0);
    });

    it('should filter by city', async () => {
      const res = await request(app)
        .get('/api/fields')
        .query({ city: 'Toronto' });

      expect(res.status).toBe(200);
      expect(res.body.data.fields.every(f => f.address.city.includes('Toronto'))).toBe(true);
    });

    it('should filter by field type', async () => {
      const res = await request(app)
        .get('/api/fields')
        .query({ field_type: 'turf' });

      expect(res.status).toBe(200);
      expect(res.body.data.fields.every(f => f.field_type === 'turf')).toBe(true);
    });

    it('should filter by size', async () => {
      const res = await request(app)
        .get('/api/fields')
        .query({ size: '11v11' });

      expect(res.status).toBe(200);
    });

    it('should filter by max price', async () => {
      const res = await request(app)
        .get('/api/fields')
        .query({ max_price: 200 });

      expect(res.status).toBe(200);
      expect(res.body.data.fields.every(f => f.hourly_rate <= 200)).toBe(true);
    });
  });

  describe('GET /api/fields/:id', () => {
    let fieldId;

    beforeEach(async () => {
      const field = await Field.findOne({ name: validField.name });
      fieldId = field._id.toString();
    });

    it('should get a single field', async () => {
      const res = await request(app)
        .get(`/api/fields/${fieldId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.field.name).toBe(validField.name);
    });

    it('should return 404 for non-existent field', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/fields/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/fields/:id/availability', () => {
    let fieldId;

    beforeEach(async () => {
      const field = await Field.findOne({ name: validField.name });
      fieldId = field._id.toString();
    });

    it('should get field availability for a date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(app)
        .get(`/api/fields/${fieldId}/availability`)
        .query({ date: tomorrow.toISOString().split('T')[0] });

      expect(res.status).toBe(200);
      expect(res.body.data.field_id).toBe(fieldId);
      expect(res.body.data.hourly_rate).toBe(validField.hourly_rate);
    });

    it('should fail without date parameter', async () => {
      const res = await request(app)
        .get(`/api/fields/${fieldId}/availability`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Date');
    });
  });
});
