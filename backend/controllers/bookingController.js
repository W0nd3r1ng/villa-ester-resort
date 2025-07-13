const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../uploads/proof');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Export the multer middleware for use in routes
exports.uploadProof = upload.single('proofOfPayment');

/**
 * Get all bookings with optional filtering and pagination
 */
exports.getAllBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      userId, 
      startDate, 
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const bookings = await Booking.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .populate('serviceId', 'name price duration');

    // Get total count for pagination
    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

/**
 * Get a single booking by ID
 */
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name price duration description');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

/**
 * Create a new booking
 */
exports.createBooking = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // If file uploaded, save its path
    let proofOfPaymentUrl = '';
    if (req.file) {
      proofOfPaymentUrl = `/uploads/proof/${req.file.filename}`;
    }

    const {
      userId,
      serviceId,
      bookingDate,
      bookingTime,
      duration,
      numberOfPeople,
      specialRequests,
      contactPhone,
      contactEmail,
      notes,
      fullName,
      cottageType
    } = req.body;

    // Check if the time slot is available (skip for now for walk-in)

    // Create new booking
    const booking = new Booking({
      userId,
      serviceId,
      bookingDate,
      bookingTime,
      duration,
      numberOfPeople,
      specialRequests,
      contactPhone,
      contactEmail,
      notes,
      fullName,
      cottageType,
      proofOfPayment: proofOfPaymentUrl,
      status: 'pending',
      createdAt: new Date()
    });

    const savedBooking = await booking.save();

    // Populate the saved booking with user and service details
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('userId', 'name email')
      .populate('serviceId', 'name price duration');

    // Emit Socket.IO event for new booking
    const io = req.app.get('io');
    if (io) {
      io.emit('booking-created', {
        booking: populatedBooking,
        message: 'New booking created',
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

/**
 * Update a booking
 */
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // If updating date/time, check availability
    if (updateData.bookingDate || updateData.bookingTime) {
      const checkDate = updateData.bookingDate || booking.bookingDate;
      const checkTime = updateData.bookingTime || booking.bookingTime;
      const checkServiceId = updateData.serviceId || booking.serviceId;

      const existingBooking = await Booking.findOne({
        _id: { $ne: id }, // Exclude current booking
        serviceId: checkServiceId,
        bookingDate: checkDate,
        bookingTime: checkTime,
        status: { $nin: ['cancelled', 'rejected'] }
      });

      if (existingBooking) {
        return res.status(409).json({
          success: false,
          message: 'This time slot is already booked'
        });
      }
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('userId', 'name email')
     .populate('serviceId', 'name price duration');

    // Emit Socket.IO event for booking update
    const io = req.app.get('io');
    if (io) {
      io.to(`booking-${id}`).emit('booking-updated', {
        booking: updatedBooking,
        message: 'Booking updated',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

/**
 * Cancel a booking
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancellationReason,
        cancelledAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email')
     .populate('serviceId', 'name price duration');

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

/**
 * Delete a booking (admin only)
 */
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await Booking.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
};

/**
 * Get bookings by user ID
 */
exports.getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('serviceId', 'name price duration');

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user bookings',
      error: error.message
    });
  }
};

/**
 * Get booking statistics
 */
exports.getBookingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalBookings = await Booking.countDocuments(filter);
    const pendingBookings = await Booking.countDocuments({ ...filter, status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ ...filter, status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ ...filter, status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ ...filter, status: 'cancelled' });

    res.json({
      success: true,
      data: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
};

/**
 * Check availability for a specific date and time
 */
exports.checkAvailability = async (req, res) => {
  try {
    const { serviceId, bookingDate, bookingTime } = req.query;

    if (!serviceId || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: 'Service ID, booking date, and booking time are required'
      });
    }

    const existingBooking = await Booking.findOne({
      serviceId,
      bookingDate: new Date(bookingDate),
      bookingTime,
      status: { $nin: ['cancelled', 'rejected'] }
    });

    res.json({
      success: true,
      data: {
        available: !existingBooking,
        existingBooking: existingBooking ? {
          id: existingBooking._id,
          userId: existingBooking.userId
        } : null
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
}; 