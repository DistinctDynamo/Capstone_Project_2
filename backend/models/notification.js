const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'event_invite',
      'event_update',
      'event_reminder',
      'event_cancelled',
      'team_invite',
      'team_application',
      'team_application_accepted',
      'team_application_rejected',
      'team_announcement',
      'team_approved',
      'team_rejected',
      'event_approved',
      'event_rejected',
      'message',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  link: {
    type: String,
    default: ''
  },
  reference: {
    model: {
      type: String,
      enum: ['Event', 'Team', 'Conversation', 'User', 'Classified']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  read: {
    type: Boolean,
    default: false
  },
  read_at: Date
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for efficient queries
notificationSchema.index({ user: 1, read: 1, created_at: -1 });
notificationSchema.index({ user: 1, created_at: -1 });

// Auto-delete old notifications (keep last 100 per user)
notificationSchema.statics.cleanupOldNotifications = async function(userId) {
  const notifications = await this.find({ user: userId })
    .sort({ created_at: -1 })
    .skip(100)
    .select('_id');

  if (notifications.length > 0) {
    await this.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
  }
};

module.exports = mongoose.model('Notification', notificationSchema);
