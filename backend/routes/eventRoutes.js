const express = require('express');
const Event = require('../models/events');
const Notification = require('../models/notification');
const { protect, optionalAuth } = require('../middleware/auth');
const { eventValidation, mongoIdValidation, paginationValidation } = require('../middleware/validators');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with filters and pagination
// @access  Public
router.get('/', optionalAuth, paginationValidation, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter - only show approved events to public
    const filter = {
      status: { $in: ['upcoming', 'ongoing'] },
      approval_status: 'approved'
    };

    if (req.query.event_type) {
      filter.event_type = req.query.event_type;
    }

    if (req.query.city) {
      filter['location.city'] = { $regex: req.query.city, $options: 'i' };
    }

    if (req.query.skill_level && req.query.skill_level !== 'all') {
      filter.skill_level = req.query.skill_level;
    }

    if (req.query.date_from) {
      filter.date = { $gte: new Date(req.query.date_from) };
    }

    if (req.query.date_to) {
      filter.date = { ...filter.date, $lte: new Date(req.query.date_to) };
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const events = await Event.find(filter)
      .populate('creator', 'username first_name last_name avatar')
      .populate('team', 'team_name logo')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 });

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: {
        events,
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

// @route   GET /api/events/user/my-events
// @desc    Get events created by current user
// @access  Private
router.get('/user/my-events', protect, async (req, res, next) => {
  try {
    const events = await Event.find({ creator: req.user._id })
      .sort({ date: -1 })
      .populate('team', 'team_name logo');

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events/user/attending
// @desc    Get events user is attending or has pending requests
// @access  Private
router.get('/user/attending', protect, async (req, res, next) => {
  try {
    // Get events where user is a participant or has a pending request
    const events = await Event.find({
      $or: [
        { 'participants.user': req.user._id },
        { 'join_requests.user': req.user._id },
        // Legacy support
        { 'interested.user': req.user._id, 'interested.status': 'going' }
      ],
      status: { $in: ['upcoming', 'ongoing'] }
    })
      .populate('creator', 'username first_name last_name avatar')
      .sort({ date: 1 });

    // Add user's status to each event
    const eventsWithStatus = events.map(event => {
      const eventObj = event.toObject();

      // Check if user is a participant
      const isParticipant = event.participants?.some(
        p => p.user.toString() === req.user._id.toString()
      );

      // Check if user has a pending request
      const pendingRequest = event.join_requests?.find(
        r => r.user.toString() === req.user._id.toString() && r.status === 'pending'
      );

      // Check legacy interested array
      const isGoing = event.interested?.some(
        i => i.user.toString() === req.user._id.toString() && i.status === 'going'
      );

      if (isParticipant || isGoing) {
        eventObj.user_status = 'approved';
      } else if (pendingRequest) {
        eventObj.user_status = 'pending';
      } else {
        eventObj.user_status = 'none';
      }

      return eventObj;
    });

    res.json({
      success: true,
      data: { events: eventsWithStatus }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public (but non-approved events only visible to creator/admin)
router.get('/:id', optionalAuth, mongoIdValidation, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'username first_name last_name avatar email')
      .populate('team', 'team_name logo')
      .populate('interested.user', 'username first_name last_name avatar')
      .populate('join_requests.user', 'username first_name last_name avatar position')
      .populate('participants.user', 'username first_name last_name avatar position');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is approved or if user is creator/admin
    const isCreator = req.user && event.creator._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.user_type === 'admin';

    if (event.approval_status !== 'approved' && !isCreator && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', protect, eventValidation, async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      creator: req.user._id
    };

    const event = await Event.create(eventData);

    const populatedEvent = await Event.findById(event._id)
      .populate('creator', 'username first_name last_name avatar');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event: populatedEvent }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (creator only)
router.put('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.creator.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'title', 'description', 'event_type', 'location', 'date',
      'start_time', 'end_time', 'price', 'max_participants',
      'skill_level', 'image', 'is_recurring', 'recurrence_pattern', 'status'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    event = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('creator', 'username first_name last_name avatar');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (creator only)
router.delete('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.creator.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/events/:id/join
// @desc    Request to join an event (pending approval)
// @access  Private
router.post('/:id/join', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const { message } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is full
    const currentCount = event.participants?.length || 0;
    if (currentCount >= event.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check if already a participant
    const isParticipant = event.participants?.some(
      p => p.user.toString() === req.user._id.toString()
    );
    if (isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already a participant'
      });
    }

    // Check if already has pending request
    const hasPendingRequest = event.join_requests?.some(
      r => r.user.toString() === req.user._id.toString() && r.status === 'pending'
    );
    if (hasPendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request'
      });
    }

    // If event doesn't require approval, add directly
    if (!event.requires_approval) {
      event.participants = event.participants || [];
      event.participants.push({
        user: req.user._id,
        joined_at: new Date()
      });
      await event.save();

      return res.status(201).json({
        success: true,
        message: 'You have joined the event!',
        data: { status: 'approved' }
      });
    }

    // Add join request
    event.join_requests = event.join_requests || [];
    event.join_requests.push({
      user: req.user._id,
      message: message || '',
      status: 'pending',
      requested_at: new Date()
    });

    await event.save();

    // Notify event creator about the join request
    const requesterName = req.user.first_name
      ? `${req.user.first_name} ${req.user.last_name || ''}`.trim()
      : req.user.username;

    await Notification.create({
      user: event.creator,
      type: 'event_invite',
      title: 'New Join Request',
      message: `${requesterName} has requested to join "${event.title}"`,
      link: `/events/${event._id}`,
      reference: { model: 'Event', id: event._id }
    });

    res.status(201).json({
      success: true,
      message: 'Join request submitted. Waiting for approval.',
      data: { status: 'pending' }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/events/:id/requests/:requestId
// @desc    Accept or reject a join request
// @access  Private (creator only)
router.put('/:id/requests/:requestId', protect, async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is creator
    if (event.creator.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the event creator can manage requests'
      });
    }

    const request = event.join_requests?.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed'
      });
    }

    request.status = status;
    request.responded_at = new Date();

    if (status === 'approved') {
      // Check if event is full
      const currentCount = event.participants?.length || 0;
      if (currentCount >= event.max_participants) {
        return res.status(400).json({
          success: false,
          message: 'Event is full'
        });
      }

      // Add to participants
      event.participants = event.participants || [];
      event.participants.push({
        user: request.user,
        joined_at: new Date()
      });

      // Notify user about approval
      await Notification.create({
        user: request.user,
        type: 'event_invite',
        title: 'Request Approved!',
        message: `Your request to join "${event.title}" has been approved!`,
        link: `/events/${event._id}`,
        reference: { model: 'Event', id: event._id }
      });
    } else {
      // Notify user about rejection
      await Notification.create({
        user: request.user,
        type: 'event_cancelled',
        title: 'Request Not Approved',
        message: `Your request to join "${event.title}" was not approved.`,
        link: '/events',
        reference: { model: 'Event', id: event._id }
      });
    }

    await event.save();

    res.json({
      success: true,
      message: `Request ${status}`
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/events/:id/participants/:userId
// @desc    Remove a participant from event
// @access  Private (creator or self)
router.delete('/:id/participants/:userId', protect, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const isCreator = event.creator.toString() === req.user._id.toString();
    const isSelf = req.params.userId === req.user._id.toString();

    if (!isCreator && !isSelf && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this participant'
      });
    }

    event.participants = event.participants?.filter(
      p => p.user.toString() !== req.params.userId
    ) || [];

    await event.save();

    res.json({
      success: true,
      message: isSelf ? 'You have left the event' : 'Participant removed'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/events/:id/interest
// @desc    Express interest in event (legacy - kept for backwards compatibility)
// @access  Private
router.post('/:id/interest', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const { status } = req.body; // 'going', 'interested', 'not_going'

    if (!['going', 'interested', 'not_going'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be going, interested, or not_going'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is full (for 'going' status)
    if (status === 'going') {
      const goingCount = event.interested.filter(i => i.status === 'going').length;
      if (goingCount >= event.max_participants) {
        return res.status(400).json({
          success: false,
          message: 'Event is full'
        });
      }
    }

    // Update or add interest
    const existingIndex = event.interested.findIndex(
      i => i.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      event.interested[existingIndex].status = status;
      event.interested[existingIndex].responded_at = new Date();
    } else {
      event.interested.push({
        user: req.user._id,
        status,
        responded_at: new Date()
      });
    }

    await event.save();

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: {
        participants_count: event.interested.filter(i => i.status === 'going').length,
        spots_left: event.max_participants - event.interested.filter(i => i.status === 'going').length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/events/:id/interest
// @desc    Remove interest from event
// @access  Private
router.delete('/:id/interest', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.interested = event.interested.filter(
      i => i.user.toString() !== req.user._id.toString()
    );

    await event.save();

    res.json({
      success: true,
      message: 'Interest removed'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
