/**
 * Booking Model
 * Tracks booking history for analytics and admin management
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // User who made the booking
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Seat that was booked
  seat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: true
  },
  // Date of the booking (normalized to start of day)
  date: {
    type: Date,
    required: true
  },
  // Booking status
  status: {
    type: String,
    enum: ['booked', 'released', 'cancelled'],
    default: 'booked'
  },
  // Admin who created the booking (for manual bookings)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Admin who released the booking
  releasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // When the booking was released
  releasedAt: {
    type: Date,
    default: null
  },
  // Reason for release (if any)
  releaseReason: {
    type: String,
    default: null
  },
  // Timestamp when booking was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ seat: 1, date: 1 });
bookingSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
