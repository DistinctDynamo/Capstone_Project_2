const express = require('express');
const Field = require('../models/field');
const Booking = require('../models/booking');
const { protect, authorize } = require('../middleware/auth');
const { mongoIdValidation, paginationValidation } = require('../middleware/validators');

const router = express.Router();

// @route   GET /api/fields
// @desc    Get all fields with filters and pagination
// @access  Public
router.get('/', paginationValidation, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { is_active: true };

    if (req.query.city) {
      filter['address.city'] = { $regex: req.query.city, $options: 'i' };
    }

    if (req.query.field_type) {
      filter.field_type = req.query.field_type;
    }

    if (req.query.size) {
      filter.size = req.query.size;
    }

    if (req.query.max_price) {
      filter.hourly_rate = { $lte: parseFloat(req.query.max_price) };
    }

    if (req.query.amenities) {
      const amenities = req.query.amenities.split(',');
      filter.amenities = { $all: amenities };
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const fields = await Field.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ 'rating.average': -1 });

    const total = await Field.countDocuments(filter);

    res.json({
      success: true,
      data: {
        fields,
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

// @route   GET /api/fields/:id
// @desc    Get single field
// @access  Public
router.get('/:id', mongoIdValidation, async (req, res, next) => {
  try {
    const field = await Field.findById(req.params.id);

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.json({
      success: true,
      data: { field }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/fields/:id/availability
// @desc    Get field availability for a specific date
// @access  Public
router.get('/:id/availability', mongoIdValidation, async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const field = await Field.findById(req.params.id);

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    // Get existing bookings for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      field: req.params.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    }).select('start_time end_time');

    // Get day of week for operating hours
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[new Date(date).getDay()];
    const operatingHours = field.operating_hours?.[dayOfWeek] || null;

    // Generate available time slots
    const bookedSlots = bookings.map(b => ({
      start: b.start_time,
      end: b.end_time
    }));

    res.json({
      success: true,
      data: {
        field_id: field._id,
        date,
        operating_hours: operatingHours,
        booked_slots: bookedSlots,
        hourly_rate: field.hourly_rate
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/fields
// @desc    Create a new field (admin only)
// @access  Private (admin)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const field = await Field.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Field created successfully',
      data: { field }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/fields/:id
// @desc    Update field (admin only)
// @access  Private (admin)
router.put('/:id', protect, authorize('admin'), mongoIdValidation, async (req, res, next) => {
  try {
    const field = await Field.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.json({
      success: true,
      message: 'Field updated successfully',
      data: { field }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/fields/:id
// @desc    Delete field (admin only)
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), mongoIdValidation, async (req, res, next) => {
  try {
    const field = await Field.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.json({
      success: true,
      message: 'Field deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/fields/nearby
// @desc    Get fields near a location
// @access  Public
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query; // maxDistance in meters

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const fields = await Field.find({
      is_active: true,
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(20);

    res.json({
      success: true,
      data: { fields }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
