const express = require('express');
const Event = require('../models/events');
const Team = require('../models/teams');
const User = require('../models/user');
const Notification = require('../models/notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// ==================== DASHBOARD STATS ====================

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTeams,
      pendingTeams,
      totalEvents,
      pendingEvents
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ is_active: true }),
      Team.countDocuments(),
      Team.countDocuments({ approval_status: 'pending' }),
      Event.countDocuments(),
      Event.countDocuments({ approval_status: 'pending' })
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        teams: { total: totalTeams, pending: pendingTeams },
        events: { total: totalEvents, pending: pendingEvents }
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== EVENT APPROVAL ====================

// @route   GET /api/admin/events/pending
// @desc    Get events pending approval
// @access  Admin only
router.get('/events/pending', async (req, res, next) => {
  try {
    const events = await Event.find({ approval_status: 'pending' })
      .populate('creator', 'username first_name last_name email')
      .populate('team', 'team_name')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/events/:id/approve
// @desc    Approve an event
// @access  Admin only
router.put('/events/:id/approve', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.approval_status = 'approved';
    event.approved_by = req.user._id;
    event.approved_at = new Date();
    await event.save();

    // Notify the event creator
    await Notification.create({
      user: event.creator,
      type: 'event_approved',
      title: 'Event Approved',
      message: `Your event "${event.title}" has been approved and is now visible to users.`,
      link: `/events/${event._id}`,
      reference: { model: 'Event', id: event._id }
    });

    res.json({
      success: true,
      message: 'Event approved successfully',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/events/:id/reject
// @desc    Reject an event
// @access  Admin only
router.put('/events/:id/reject', async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.approval_status = 'rejected';
    event.rejection_reason = reason;
    await event.save();

    // Notify the event creator
    await Notification.create({
      user: event.creator,
      type: 'event_rejected',
      title: 'Event Not Approved',
      message: `Your event "${event.title}" was not approved. Reason: ${reason}`,
      link: `/events/${event._id}`,
      reference: { model: 'Event', id: event._id }
    });

    res.json({
      success: true,
      message: 'Event rejected',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== TEAM APPROVAL ====================

// @route   GET /api/admin/teams/pending
// @desc    Get teams pending approval
// @access  Admin only
router.get('/teams/pending', async (req, res, next) => {
  try {
    const teams = await Team.find({ approval_status: 'pending' })
      .populate('owner', 'username first_name last_name email')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: { teams }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/teams/:id/approve
// @desc    Approve a team
// @access  Admin only
router.put('/teams/:id/approve', async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    team.approval_status = 'approved';
    team.approved_by = req.user._id;
    team.approved_at = new Date();
    await team.save();

    // Notify the team owner
    await Notification.create({
      user: team.owner,
      type: 'team_approved',
      title: 'Team Approved',
      message: `Your team "${team.team_name}" has been approved. You can now invite members!`,
      link: `/my-team`,
      reference: { model: 'Team', id: team._id }
    });

    res.json({
      success: true,
      message: 'Team approved successfully',
      data: { team }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/teams/:id/reject
// @desc    Reject a team
// @access  Admin only
router.put('/teams/:id/reject', async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    team.approval_status = 'rejected';
    team.rejection_reason = reason;
    await team.save();

    // Notify the team owner
    await Notification.create({
      user: team.owner,
      type: 'team_rejected',
      title: 'Team Not Approved',
      message: `Your team "${team.team_name}" was not approved. Reason: ${reason}`,
      reference: { model: 'Team', id: team._id }
    });

    res.json({
      success: true,
      message: 'Team rejected',
      data: { team }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== USER MANAGEMENT ====================

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Admin only
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.user_type) {
      filter.user_type = req.query.user_type;
    }

    if (req.query.is_active !== undefined) {
      filter.is_active = req.query.is_active === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('team', 'team_name')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
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

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role (make admin, etc.)
// @access  Admin only
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { user_type } = req.body;

    if (!['player', 'organizer', 'admin'].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { user_type },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${user_type}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban/Unban a user
// @access  Admin only
router.put('/users/:id/ban', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.is_active = !user.is_active;
    await user.save();

    res.json({
      success: true,
      message: user.is_active ? 'User unbanned' : 'User banned',
      data: { user: { _id: user._id, is_active: user.is_active } }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
