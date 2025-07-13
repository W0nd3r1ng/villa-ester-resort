const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const {
  validateCreateBooking,
  validateUpdateBooking,
  validateCancelBooking,
  validateGetBookings,
  validateGetBookingById,
  validateDeleteBooking,
  validateGetBookingsByUser,
  validateGetBookingStats,
  validateCheckAvailability,
  handleValidationErrors,
  validateDateRange,
  validateBookingTimeSlot
} = require('../middleware/bookingValidation');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings with filtering and pagination
 * @access  Private (Admin)
 */
router.get('/',
  auth,
  admin,
  validateGetBookings,
  validateDateRange,
  handleValidationErrors,
  bookingController.getAllBookings
);

/**
 * @route   GET /api/bookings/stats
 * @desc    Get booking statistics
 * @access  Private (Admin)
 */
router.get('/stats',
  auth,
  admin,
  validateGetBookingStats,
  validateDateRange,
  handleValidationErrors,
  bookingController.getBookingStats
);

/**
 * @route   GET /api/bookings/availability
 * @desc    Check availability for a specific date and time
 * @access  Public
 */
router.get('/availability',
  validateCheckAvailability,
  handleValidationErrors,
  bookingController.checkAvailability
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get a single booking by ID
 * @access  Private
 */
router.get('/:id',
  auth,
  validateGetBookingById,
  handleValidationErrors,
  bookingController.getBookingById
);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Public
 */
router.post('/', bookingController.uploadProof, bookingController.createBooking);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update a booking
 * @access  Private
 */
router.put('/:id',
  auth,
  validateUpdateBooking,
  validateBookingTimeSlot,
  handleValidationErrors,
  bookingController.updateBooking
);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.patch('/:id/cancel',
  auth,
  validateCancelBooking,
  handleValidationErrors,
  bookingController.cancelBooking
);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete a booking (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id',
  auth,
  admin,
  validateDeleteBooking,
  handleValidationErrors,
  bookingController.deleteBooking
);

/**
 * @route   GET /api/bookings/user/:userId
 * @desc    Get bookings by user ID
 * @access  Private
 */
router.get('/user/:userId',
  auth,
  validateGetBookingsByUser,
  handleValidationErrors,
  bookingController.getBookingsByUser
);

module.exports = router; 