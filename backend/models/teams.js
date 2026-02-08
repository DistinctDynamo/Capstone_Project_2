const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'captain', 'member'],
    default: 'member'
  },
  joined_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const teamSchema = new mongoose.Schema({
  team_name: {
    type: String,
    required: [true, 'Team name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Team name must be at least 2 characters'],
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [teamMemberSchema],
  logo: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  skill_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'competitive', ''],
    default: ''
  },
  preferred_positions: [{
    type: String,
    enum: ['goalkeeper', 'defender', 'midfielder', 'forward']
  }],
  max_members: {
    type: Number,
    default: 25,
    min: [5, 'Team must allow at least 5 members'],
    max: [50, 'Team cannot exceed 50 members']
  },
  is_recruiting: {
    type: Boolean,
    default: true
  },
  stats: {
    games_played: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    goals_for: { type: Number, default: 0 },
    goals_against: { type: Number, default: 0 }
  },
  invitations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    sent_at: {
      type: Date,
      default: Date.now
    }
  }],
  applications: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    applied_at: {
      type: Date,
      default: Date.now
    }
  }],
  // Team announcements
  announcements: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      maxlength: 100
    },
    content: {
      type: String,
      maxlength: 1000
    },
    created_at: {
      type: Date,
      default: Date.now
    }
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

// Index for search
teamSchema.index({ team_name: 'text', description: 'text', location: 'text' });

// Virtual for member count
teamSchema.virtual('member_count').get(function() {
  return this.members.length;
});

// Ensure virtuals are included
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Team', teamSchema);
