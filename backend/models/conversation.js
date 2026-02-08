const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group', 'team'],
    default: 'direct'
  },
  name: {
    type: String,
    maxlength: [100, 'Conversation name cannot exceed 100 characters']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  last_message: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sent_at: Date
  },
  unread_count: {
    type: Map,
    of: Number,
    default: {}
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for finding user's conversations
conversationSchema.index({ participants: 1 });
conversationSchema.index({ team: 1 });
conversationSchema.index({ updated_at: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
