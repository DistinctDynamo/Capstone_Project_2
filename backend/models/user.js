const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  date_of_birth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  email_verification_token: {
    type: String,
    default: null
  },
  email_verification_expires: {
    type: Date,
    default: null
  },
  password_reset_token: {
    type: String,
    default: null
  },
  password_reset_expires: {
    type: Date,
    default: null
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  user_type: {
    type: String,
    required: [true, 'User type is required'],
    enum: {
      values: ['player', 'manager', 'admin'],
      message: 'User type must be player, manager, or admin'
    },
    default: 'player'
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    enum: ['goalkeeper', 'defender', 'midfielder', 'forward', ''],
    default: ''
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  team_role: {
    type: String,
    enum: ['owner', 'captain', 'member', ''],
    default: ''
  },
  team_history: [{
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    team_name: String,
    role: {
      type: String,
      enum: ['owner', 'captain', 'member']
    },
    joined_at: Date,
    left_at: Date
  }],
  stats: {
    games_played: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    clean_sheets: { type: Number, default: 0 },
    // FIFA-style player attributes (1-99 scale)
    pace: { type: Number, default: 50, min: 1, max: 99 },
    shooting: { type: Number, default: 50, min: 1, max: 99 },
    passing: { type: Number, default: 50, min: 1, max: 99 },
    dribbling: { type: Number, default: 50, min: 1, max: 99 },
    defending: { type: Number, default: 50, min: 1, max: 99 },
    physical: { type: Number, default: 50, min: 1, max: 99 }
  },
  // Player skill level
  skill_level: {
    type: String,
    enum: ['recreational', 'intermediate', 'competitive', ''],
    default: ''
  },
  // FIFA-style player attributes (1-99 scale)
  player_attributes: {
    pace: { type: Number, default: 50, min: 1, max: 99 },
    shooting: { type: Number, default: 50, min: 1, max: 99 },
    passing: { type: Number, default: 50, min: 1, max: 99 },
    dribbling: { type: Number, default: 50, min: 1, max: 99 },
    defending: { type: Number, default: 50, min: 1, max: 99 },
    physical: { type: Number, default: 50, min: 1, max: 99 }
  },
  nationality: {
    type: String,
    default: ''
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  is_active: {
    type: Boolean,
    default: true
  },
  // Online status tracking
  is_online: {
    type: Boolean,
    default: false
  },
  last_active: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for search
userSchema.index({ username: 'text', first_name: 'text', last_name: 'text' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.isValidPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Get full name virtual
userSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
