const express = require('express');
const User = require('../models/user');
const { protect, authorize } = require('../middleware/auth');
const { mongoIdValidation, paginationValidation } = require('../middleware/validators');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (with pagination and filters)
// @access  Private
router.get('/', protect, paginationValidation, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { is_active: true };

    if (req.query.user_type) {
      filter.user_type = req.query.user_type;
    }

    if (req.query.position) {
      filter.position = req.query.position;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const users = await User.find(filter)
      .select('-stats -notifications')
      .populate('team', 'team_name logo')
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

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', protect, async (req, res, next) => {
  try {
    const { q, position, skill_level } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filter = {
      is_active: true,
      $text: { $search: q }
    };

    if (position) filter.position = position;

    const users = await User.find(filter)
      .select('username first_name last_name avatar position team')
      .populate('team', 'team_name')
      .limit(20);

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', mongoIdValidation, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('team', 'team_name logo description');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (owner only)
router.put('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    // Check ownership
    if (req.user._id.toString() !== req.params.id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'first_name', 'last_name', 'avatar', 'bio', 'location',
      'phone', 'position', 'notifications'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('team', 'team_name logo');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id/stats
// @desc    Update user stats
// @access  Private (owner or admin)
router.put('/:id/stats', protect, mongoIdValidation, async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update stats'
      });
    }

    const { games_played, goals, assists, clean_sheets } = req.body;

    const updates = {};
    if (games_played !== undefined) updates['stats.games_played'] = games_played;
    if (goals !== undefined) updates['stats.goals'] = goals;
    if (assists !== undefined) updates['stats.assists'] = assists;
    if (clean_sheets !== undefined) updates['stats.clean_sheets'] = clean_sheets;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Stats updated successfully',
      data: { stats: user.stats }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user account
// @access  Private (owner or admin)
router.delete('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
