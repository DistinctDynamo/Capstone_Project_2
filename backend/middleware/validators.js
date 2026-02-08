const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array().map(e => e.msg)
    });
  }
  next();
};

// Auth validators
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('date_of_birth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please enter a valid date of birth'),
  body('user_type')
    .optional()
    .isIn(['player', 'manager'])
    .withMessage('User type must be player or manager'),
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Event validators
const eventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('event_type')
    .isIn(['pickup_game', 'tournament', 'training', 'tryout', 'social', 'other'])
    .withMessage('Invalid event type'),
  body('location.name')
    .trim()
    .notEmpty()
    .withMessage('Location name is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('start_time')
    .notEmpty()
    .withMessage('Start time is required'),
  body('end_time')
    .notEmpty()
    .withMessage('End time is required'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('max_participants')
    .optional()
    .isInt({ min: 2 })
    .withMessage('Must allow at least 2 participants'),
  validate
];

// Team validators
const teamValidation = [
  body('team_name')
    .trim()
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Team name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('skill_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'competitive', ''])
    .withMessage('Invalid skill level'),
  validate
];

// Classified validators
const classifiedValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('classified_type')
    .isIn(['looking_for_players', 'looking_for_team', 'equipment_sale', 'equipment_wanted', 'coaching', 'other'])
    .withMessage('Invalid classified type'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  validate
];

// Booking validators
const bookingValidation = [
  body('field')
    .isMongoId()
    .withMessage('Valid field ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('start_time')
    .notEmpty()
    .withMessage('Start time is required'),
  body('end_time')
    .notEmpty()
    .withMessage('End time is required'),
  validate
];

// MongoDB ID validator
const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  eventValidation,
  teamValidation,
  classifiedValidation,
  bookingValidation,
  mongoIdValidation,
  paginationValidation
};
