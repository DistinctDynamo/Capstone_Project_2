const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event_type: {
    type: String,
    enum: ['pickup_game', 'tournament', 'training', 'tryout', 'social', 'other'],
    required: [true, 'Event type is required']
  },
  location: {
    name: {
      type: String,
      required: [true, 'Location name is required']
    },
    address: String,
    city: {
      type: String,
      default: ''
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  start_time: {
    type: String,
    required: [true, 'Start time is required']
  },
  end_time: {
    type: String,
    required: [true, 'End time is required']
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  max_participants: {
    type: Number,
    default: 22,
    min: [2, 'Must allow at least 2 participants']
  },
  skill_level: {
    type: String,
    enum: ['all', 'beginner', 'intermediate', 'advanced', 'competitive'],
    default: 'all'
  },
  image: {
    type: String,
    default: ''
  },
  interested: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['going', 'interested', 'not_going'],
      default: 'interested'
    },
    responded_at: {
      type: Date,
      default: Date.now
    }
  }],
  is_recurring: {
    type: Boolean,
    default: false
  },
  recurrence_pattern: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', ''],
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  // Visibility settings for event broadcasting
  visibility: {
    type: String,
    enum: ['public', 'team_only', 'invite_only'],
    default: 'public'
  },
  invited_users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Admin approval system
  approval_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_at: Date,
  rejection_reason: String
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ title: 'text', description: 'text' });

// Virtual for participants count
eventSchema.virtual('participants_count').get(function() {
  return this.interested.filter(i => i.status === 'going').length;
});

// Virtual for spots left
eventSchema.virtual('spots_left').get(function() {
  const going = this.interested.filter(i => i.status === 'going').length;
  return this.max_participants - going;
});

// Ensure virtuals are included
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
