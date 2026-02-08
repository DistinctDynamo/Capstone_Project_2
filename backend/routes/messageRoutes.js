const express = require('express');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const User = require('../models/user');
const { protect } = require('../middleware/auth');
const { mongoIdValidation, paginationValidation } = require('../middleware/validators');

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', protect, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      is_active: true
    })
      .populate('participants', 'username first_name last_name avatar is_online last_active')
      .populate('team', 'team_name logo')
      .populate('last_message.sender', 'username first_name last_name')
      .sort({ updated_at: -1 });

    // Add unread count for current user
    const conversationsWithUnread = conversations.map(conv => {
      const unread = conv.unread_count?.get(req.user._id.toString()) || 0;
      return {
        ...conv.toObject(),
        unread_count: unread
      };
    });

    res.json({
      success: true,
      data: { conversations: conversationsWithUnread }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Get single conversation with messages
// @access  Private
router.get('/conversations/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'username first_name last_name avatar')
      .populate('team', 'team_name logo');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    // Get messages with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      conversation: req.params.id,
      is_deleted: false
    })
      .populate('sender', 'username first_name last_name avatar')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Message.countDocuments({
      conversation: req.params.id,
      is_deleted: false
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user._id },
        'read_by.user': { $ne: req.user._id }
      },
      {
        $push: {
          read_by: {
            user: req.user._id,
            read_at: new Date()
          }
        }
      }
    );

    // Reset unread count for this user
    if (conversation.unread_count) {
      conversation.unread_count.set(req.user._id.toString(), 0);
      await conversation.save();
    }

    res.json({
      success: true,
      data: {
        conversation,
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/conversations
// @desc    Create or get existing conversation
// @access  Private
router.post('/conversations', protect, async (req, res, next) => {
  try {
    const { participantId, type = 'direct', name } = req.body;

    if (type === 'direct') {
      if (!participantId) {
        return res.status(400).json({
          success: false,
          message: 'Participant ID is required for direct conversations'
        });
      }

      // Check if participant exists
      const participant = await User.findById(participantId);
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check for existing direct conversation
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [req.user._id, participantId], $size: 2 }
      }).populate('participants', 'username first_name last_name avatar');

      if (existingConversation) {
        return res.json({
          success: true,
          data: { conversation: existingConversation }
        });
      }

      // Create new conversation
      const conversation = await Conversation.create({
        type: 'direct',
        participants: [req.user._id, participantId]
      });

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username first_name last_name avatar');

      return res.status(201).json({
        success: true,
        message: 'Conversation created',
        data: { conversation: populatedConversation }
      });
    }

    // Group conversation
    if (type === 'group') {
      const { participantIds } = req.body;

      if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 1) {
        return res.status(400).json({
          success: false,
          message: 'At least one participant is required for group conversations'
        });
      }

      const allParticipants = [req.user._id, ...participantIds];

      const conversation = await Conversation.create({
        type: 'group',
        name: name || 'Group Chat',
        participants: allParticipants
      });

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username first_name last_name avatar');

      return res.status(201).json({
        success: true,
        message: 'Group conversation created',
        data: { conversation: populatedConversation }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid conversation type'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/conversations/:id/messages
// @desc    Send a message
// @access  Private
router.post('/conversations/:id/messages', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const { content, message_type = 'text', attachments } = req.body;

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message content or attachments required'
      });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    // Create message
    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      content,
      message_type,
      attachments: attachments || [],
      read_by: [{
        user: req.user._id,
        read_at: new Date()
      }]
    });

    // Update conversation's last message and unread counts
    conversation.last_message = {
      content: content || 'Attachment',
      sender: req.user._id,
      sent_at: new Date()
    };

    // Increment unread count for other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        const currentCount = conversation.unread_count?.get(participantId.toString()) || 0;
        conversation.unread_count.set(participantId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username first_name last_name avatar');

    res.status(201).json({
      success: true,
      data: { message: populatedMessage }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (soft delete)
// @access  Private
router.delete('/:messageId', protect, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    message.is_deleted = true;
    message.content = 'This message has been deleted';
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/conversations/:id/poll
// @desc    Poll for new messages (long polling alternative to WebSocket)
// @access  Private
router.get('/conversations/:id/poll', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const { since } = req.query; // Timestamp of last received message

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get new messages since timestamp
    const filter = {
      conversation: req.params.id,
      is_deleted: false
    };

    if (since) {
      filter.created_at = { $gt: new Date(since) };
    }

    const messages = await Message.find(filter)
      .populate('sender', 'username first_name last_name avatar')
      .sort({ created_at: 1 })
      .limit(50);

    // Mark as read
    if (messages.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: messages.map(m => m._id) },
          sender: { $ne: req.user._id },
          'read_by.user': { $ne: req.user._id }
        },
        {
          $push: {
            read_by: {
              user: req.user._id,
              read_at: new Date()
            }
          }
        }
      );

      // Reset unread count
      conversation.unread_count.set(req.user._id.toString(), 0);
      await conversation.save();
    }

    res.json({
      success: true,
      data: {
        messages,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/messages/conversations/:id/leave
// @desc    Leave a group conversation
// @access  Private
router.put('/conversations/:id/leave', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.type === 'direct') {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave a direct conversation'
      });
    }

    // Remove user from participants
    conversation.participants = conversation.participants.filter(
      p => p.toString() !== req.user._id.toString()
    );

    // If no participants left, mark as inactive
    if (conversation.participants.length === 0) {
      conversation.is_active = false;
    }

    await conversation.save();

    // Add system message
    await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      content: `${req.user.first_name} left the conversation`,
      message_type: 'system'
    });

    res.json({
      success: true,
      message: 'Left the conversation'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
