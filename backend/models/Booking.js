const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Booking date cannot be in the past'
    }
  },
  bookingTime: {
    type: String,
    required: [true, 'Booking time is required'],
    validate: {
      validator: function(value) {
        // Validate time format (HH:MM)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(value);
      },
      message: 'Invalid time format. Use HH:MM format'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  numberOfPeople: {
    type: Number,
    required: [true, 'Number of people is required'],
    min: [1, 'At least one person is required'],
    max: [50, 'Maximum 50 people allowed']
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    validate: {
      validator: function(value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Invalid phone number format'
    }
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    validate: {
      validator: function(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: 'Invalid email format'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  totalPrice: {
    type: Number,
    min: [0, 'Total price cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  confirmedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ serviceId: 1, bookingDate: 1, bookingTime: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ bookingDate: 1, status: 1 });

// Virtual for formatted booking date
bookingSchema.virtual('formattedBookingDate').get(function() {
  return this.bookingDate.toLocaleDateString();
});

// Virtual for formatted booking time
bookingSchema.virtual('formattedBookingTime').get(function() {
  return this.bookingTime;
});

// Virtual for booking status color (for UI)
bookingSchema.virtual('statusColor').get(function() {
  const statusColors = {
    pending: 'yellow',
    confirmed: 'green',
    completed: 'blue',
    cancelled: 'red',
    rejected: 'gray'
  };
  return statusColors[this.status] || 'gray';
});

// Pre-save middleware to update timestamps
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to set confirmation timestamp
bookingSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(serviceId, bookingDate, bookingTime, excludeBookingId = null) {
  const filter = {
    serviceId,
    bookingDate: new Date(bookingDate),
    bookingTime,
    status: { $nin: ['cancelled', 'rejected'] }
  };

  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  const existingBooking = await this.findOne(filter);
  return !existingBooking;
};

// Static method to get bookings by date range
bookingSchema.statics.getBookingsByDateRange = async function(startDate, endDate, serviceId = null) {
  const filter = {
    bookingDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    status: { $nin: ['cancelled', 'rejected'] }
  };

  if (serviceId) {
    filter.serviceId = serviceId;
  }

  return await this.find(filter)
    .populate('userId', 'name email')
    .populate('serviceId', 'name price duration')
    .sort({ bookingDate: 1, bookingTime: 1 });
};

// Instance method to cancel booking
bookingSchema.methods.cancel = async function(reason) {
  if (this.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }
  if (this.status === 'completed') {
    throw new Error('Cannot cancel a completed booking');
  }

  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return await this.save();
};

// Instance method to confirm booking
bookingSchema.methods.confirm = async function() {
  if (this.status === 'confirmed') {
    throw new Error('Booking is already confirmed');
  }
  if (this.status === 'cancelled') {
    throw new Error('Cannot confirm a cancelled booking');
  }

  this.status = 'confirmed';
  this.confirmedAt = new Date();
  return await this.save();
};

// Instance method to complete booking
bookingSchema.methods.complete = async function() {
  if (this.status === 'completed') {
    throw new Error('Booking is already completed');
  }
  if (this.status === 'cancelled') {
    throw new Error('Cannot complete a cancelled booking');
  }

  this.status = 'completed';
  this.completedAt = new Date();
  return await this.save();
};

// Instance method to calculate total price
bookingSchema.methods.calculateTotalPrice = async function() {
  // This would typically fetch the service price and apply any discounts
  // For now, we'll return a placeholder
  return this.totalPrice || 0;
};

module.exports = mongoose.model('Booking', bookingSchema); 