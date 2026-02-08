const express = require('express');
const Classified = require('../models/classified');
const { protect, optionalAuth } = require('../middleware/auth');
const { classifiedValidation, mongoIdValidation, paginationValidation } = require('../middleware/validators');

const router = express.Router();

// @route   GET /api/classifieds
// @desc    Get all classifieds with filters and pagination
// @access  Public
router.get('/', optionalAuth, paginationValidation, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter - only show approved classifieds to public
    const filter = { status: 'active', approval_status: 'approved' };

    if (req.query.classified_type) {
      filter.classified_type = req.query.classified_type;
    }

    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.position_needed) {
      filter.position_needed = req.query.position_needed;
    }

    if (req.query.skill_level) {
      filter.skill_level = req.query.skill_level;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const classifieds = await Classified.find(filter)
      .populate('creator', 'username first_name last_name avatar')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Classified.countDocuments(filter);

    res.json({
      success: true,
      data: {
        classifieds,
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

// @route   GET /api/classifieds/user/my-classifieds
// @desc    Get classifieds created by current user
// @access  Private
router.get('/user/my-classifieds', protect, async (req, res, next) => {
  try {
    const classifieds = await Classified.find({ creator: req.user._id })
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: { classifieds }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/classifieds/:id
// @desc    Get single classified
// @access  Public
router.get('/:id', mongoIdValidation, async (req, res, next) => {
  try {
    const classified = await Classified.findById(req.params.id)
      .populate('creator', 'username first_name last_name avatar email')
      .populate('responses.user', 'username first_name last_name avatar');

    if (!classified) {
      return res.status(404).json({
        success: false,
        message: 'Classified not found'
      });
    }

    res.json({
      success: true,
      data: { classified }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/classifieds
// @desc    Create a new classified
// @access  Private
router.post('/', protect, classifiedValidation, async (req, res, next) => {
  try {
    const classifiedData = {
      ...req.body,
      creator: req.user._id,
      contact_email: req.body.contact_email || req.user.email
    };

    const classified = await Classified.create(classifiedData);

    const populatedClassified = await Classified.findById(classified._id)
      .populate('creator', 'username first_name last_name avatar');

    res.status(201).json({
      success: true,
      message: 'Classified created successfully. It will be visible after admin approval.',
      data: { classified: populatedClassified }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/classifieds/:id
// @desc    Update classified
// @access  Private (creator only)
router.put('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    let classified = await Classified.findById(req.params.id);

    if (!classified) {
      return res.status(404).json({
        success: false,
        message: 'Classified not found'
      });
    }

    // Check ownership
    if (classified.creator.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this classified'
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'title', 'classified_type', 'description', 'location', 'price',
      'images', 'contact_email', 'contact_phone', 'position_needed',
      'skill_level', 'status'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    classified = await Classified.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('creator', 'username first_name last_name avatar');

    res.json({
      success: true,
      message: 'Classified updated successfully',
      data: { classified }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/classifieds/:id
// @desc    Delete classified
// @access  Private (creator only)
router.delete('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const classified = await Classified.findById(req.params.id);

    if (!classified) {
      return res.status(404).json({
        success: false,
        message: 'Classified not found'
      });
    }

    // Check ownership
    if (classified.creator.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this classified'
      });
    }

    await Classified.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Classified deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/classifieds/:id/respond
// @desc    Respond to a classified
// @access  Private
router.post('/:id/respond', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const classified = await Classified.findById(req.params.id);

    if (!classified) {
      return res.status(404).json({
        success: false,
        message: 'Classified not found'
      });
    }

    if (classified.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This classified is no longer active'
      });
    }

    // Check if user has already responded
    const hasResponded = classified.responses.some(
      r => r.user.toString() === req.user._id.toString()
    );

    if (hasResponded) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this classified'
      });
    }

    classified.responses.push({
      user: req.user._id,
      message,
      responded_at: new Date()
    });

    await classified.save();

    res.status(201).json({
      success: true,
      message: 'Response sent successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/classifieds/:id/mark-filled
// @desc    Mark classified as filled
// @access  Private (creator only)
router.put('/:id/mark-filled', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const classified = await Classified.findById(req.params.id);

    if (!classified) {
      return res.status(404).json({
        success: false,
        message: 'Classified not found'
      });
    }

    if (classified.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    classified.status = 'filled';
    await classified.save();

    res.json({
      success: true,
      message: 'Classified marked as filled'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
