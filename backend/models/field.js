const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  start_time: {
    type: String,
    required: true
  },
  end_time: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true,
    maxlength: [100, 'Field name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    province: {
      type: String,
      default: 'Ontario'
    },
    postal_code: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [{
    type: String
  }],
  field_type: {
    type: String,
    enum: ['indoor', 'outdoor', 'turf', 'grass'],
    required: [true, 'Field type is required']
  },
  size: {
    type: String,
    enum: ['5v5', '7v7', '11v11', 'futsal'],
    required: [true, 'Field size is required']
  },
  amenities: [{
    type: String,
    enum: ['parking', 'changing_rooms', 'showers', 'lighting', 'seating', 'equipment_rental', 'refreshments']
  }],
  operating_hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  time_slots: [timeSlotSchema],
  hourly_rate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Hourly rate cannot be negative']
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
fieldSchema.index({ 'address.city': 1 });
fieldSchema.index({ field_type: 1, size: 1 });
fieldSchema.index({ name: 'text', description: 'text' });
fieldSchema.index({ 'address.coordinates': '2dsphere' });

module.exports = mongoose.model('Field', fieldSchema);
