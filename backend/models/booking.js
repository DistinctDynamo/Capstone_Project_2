const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  start_time: {
    type: String,
    required: [true, 'Start time is required']
  },
  end_time: {
    type: String,
    required: [true, 'End time is required']
  },
  duration_hours: {
    type: Number,
    required: true,
    min: [0.5, 'Minimum booking is 30 minutes']
  },
  total_price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cancellation_reason: {
    type: String
  },
  cancelled_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
bookingSchema.index({ field: 1, date: 1, start_time: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });

// Compound index to prevent double bookings
bookingSchema.index(
  { field: 1, date: 1, start_time: 1, end_time: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

module.exports = mongoose.model('Booking', bookingSchema);
