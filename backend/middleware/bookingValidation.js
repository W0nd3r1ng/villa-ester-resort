const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Validation rules for creating a booking
exports.validateCreateBooking = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isMongoId()
    .withMessage('Invalid service ID format'),
  
  body('bookingDate')
    .notEmpty()
    .withMessage('Booking date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const bookingDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        throw new Error('Booking date cannot be in the past');
      }
      return true;
    }),
  
  body('bookingTime')
    .notEmpty()
    .withMessage('Booking time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format. Use HH:MM format'),
  
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 minutes and 8 hours'),
  
  body('numberOfPeople')
    .notEmpty()
    .withMessage('Number of people is required')
    .isInt({ min: 1, max: 50 })
    .withMessage('Number of people must be between 1 and 50'),
  
  body('contactPhone')
    .notEmpty()
    .withMessage('Contact phone is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid phone number format'),
  
  body('contactEmail')
    .notEmpty()
    .withMessage('Contact email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters')
];

// Validation rules for updating a booking
exports.validateUpdateBooking = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  body('serviceId')
    .optional()
    .isMongoId()
    .withMessage('Invalid service ID format'),
  
  body('bookingDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const bookingDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        throw new Error('Booking date cannot be in the past');
      }
      return true;
    }),
  
  body('bookingTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format. Use HH:MM format'),
  
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 minutes and 8 hours'),
  
  body('numberOfPeople')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Number of people must be between 1 and 50'),
  
  body('contactPhone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid phone number format'),
  
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'rejected'])
    .withMessage('Invalid status value'),
  
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters'),
  
  body('cancellationReason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'refunded', 'failed'])
    .withMessage('Invalid payment status value'),
  
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'])
    .withMessage('Invalid payment method value')
];

// Validation rules for cancelling a booking
exports.validateCancelBooking = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  
  body('cancellationReason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters')
];

// Validation rules for getting bookings
exports.validateGetBookings = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'rejected'])
    .withMessage('Invalid status value'),
  
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'bookingDate', 'status', 'totalPrice'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"')
];

// Validation rules for getting booking by ID
exports.validateGetBookingById = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID format')
];

// Validation rules for deleting a booking
exports.validateDeleteBooking = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID format')
];

// Validation rules for getting bookings by user
exports.validateGetBookingsByUser = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'rejected'])
    .withMessage('Invalid status value')
];

// Validation rules for getting booking statistics
exports.validateGetBookingStats = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

// Validation rules for checking availability
exports.validateCheckAvailability = [
  query('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isMongoId()
    .withMessage('Invalid service ID format'),
  
  query('bookingDate')
    .notEmpty()
    .withMessage('Booking date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  query('bookingTime')
    .notEmpty()
    .withMessage('Booking time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format. Use HH:MM format')
];

// Custom validation middleware to handle validation results
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Custom validation for date range
exports.validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }
  }
  
  next();
};

// Custom validation for booking time slots
exports.validateBookingTimeSlot = async (req, res, next) => {
  try {
    const { bookingDate, bookingTime, duration } = req.body;
    const { id } = req.params; // For updates
    
    if (bookingDate && bookingTime) {
      const booking = new Date(bookingDate);
      const [hours, minutes] = bookingTime.split(':').map(Number);
      
      // Check if booking time is within business hours (8 AM to 8 PM)
      if (hours < 8 || hours >= 20) {
        return res.status(400).json({
          success: false,
          message: 'Booking time must be between 8:00 AM and 8:00 PM'
        });
      }
      
      // Check if booking is not on weekends (optional business rule)
      const dayOfWeek = booking.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return res.status(400).json({
          success: false,
          message: 'Bookings are not available on weekends'
        });
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
}; 