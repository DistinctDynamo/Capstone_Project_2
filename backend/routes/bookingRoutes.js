const express = require('express');
const Booking = require('../models/booking');
const Field = require('../models/field');
const { protect } = require('../middleware/auth');
const { bookingValidation, mongoIdValidation, paginationValidation } = require('../middleware/validators');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', protect, paginationValidation, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { user: req.user._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.upcoming === 'true') {
      filter.date = { $gte: new Date() };
      filter.status = { $in: ['pending', 'confirmed'] };
    }

    const bookings = await Booking.find(filter)
      .populate('field', 'name address images hourly_rate')
      .populate('team', 'team_name logo')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
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

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('field', 'name address images hourly_rate contact operating_hours')
      .populate('user', 'username first_name last_name email')
      .populate('team', 'team_name logo');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', protect, bookingValidation, async (req, res, next) => {
  try {
    const { field, date, start_time, end_time, team, notes } = req.body;

    // Check if field exists and is active
    const fieldDoc = await Field.findById(field);
    if (!fieldDoc || !fieldDoc.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Field not found or not available'
      });
    }

    // Check for conflicting bookings
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingBooking = await Booking.findOne({
      field,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { start_time: { $lt: end_time }, end_time: { $gt: start_time } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Calculate duration and price
    const startHour = parseInt(start_time.split(':')[0]) + parseInt(start_time.split(':')[1]) / 60;
    const endHour = parseInt(end_time.split(':')[0]) + parseInt(end_time.split(':')[1]) / 60;
    const duration_hours = endHour - startHour;

    if (duration_hours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const total_price = duration_hours * fieldDoc.hourly_rate;

    const booking = await Booking.create({
      field,
      user: req.user._id,
      team: team || null,
      date: new Date(date),
      start_time,
      end_time,
      duration_hours,
      total_price,
      notes,
      status: 'pending'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('field', 'name address hourly_rate')
      .populate('team', 'team_name logo');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Can only update pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only modify pending bookings'
      });
    }

    const allowedFields = ['notes', 'team'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('field', 'name address hourly_rate')
      .populate('team', 'team_name logo');

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/bookings/:id/confirm
// @desc    Confirm a booking (admin only in real app, auto-confirm for demo)
// @access  Private
router.put('/:id/confirm', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only confirm pending bookings'
      });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking confirmed'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled'
      });
    }

    booking.status = 'cancelled';
    booking.cancellation_reason = req.body.reason || '';
    booking.cancelled_at = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking (only cancelled bookings)
// @access  Private
router.delete('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this booking'
      });
    }

    // Can only delete cancelled bookings
    if (booking.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete cancelled bookings'
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
