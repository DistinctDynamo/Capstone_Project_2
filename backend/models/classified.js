const mongoose = require('mongoose');

const classifiedSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  classified_type: {
    type: String,
    required: [true, 'Classified type is required'],
    enum: {
      values: ['looking_for_players', 'looking_for_team', 'equipment_sale', 'equipment_wanted', 'coaching', 'other'],
      message: 'Invalid classified type'
    }
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
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  images: [{
    type: String
  }],
  contact_email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  contact_phone: {
    type: String
  },
  position_needed: {
    type: String,
    enum: ['goalkeeper', 'defender', 'midfielder', 'forward', 'any', ''],
    default: ''
  },
  skill_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'competitive', 'any', ''],
    default: ''
  },
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      maxlength: [500, 'Response message cannot exceed 500 characters']
    },
    responded_at: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'filled', 'expired', 'deleted'],
    default: 'active'
  },
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  // Admin approval fields
  approval_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_at: {
    type: Date
  },
  rejection_reason: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
classifiedSchema.index({ classified_type: 1, status: 1 });
classifiedSchema.index({ location: 1 });
classifiedSchema.index({ title: 'text', description: 'text' });
classifiedSchema.index({ expires_at: 1 });

// Virtual for response count
classifiedSchema.virtual('response_count').get(function() {
  return this.responses.length;
});

// Ensure virtuals are included
classifiedSchema.set('toJSON', { virtuals: true });
classifiedSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Classified', classifiedSchema);
