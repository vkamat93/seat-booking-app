/**
 * Booking Model
 * Tracks seat reservations, scheduling, and history
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: true
    },
    // The specific date for this booking
    date: {
        type: Date,
        required: true
    },
    // Status of the booking
    status: {
        type: String,
        enum: ['booked', 'released'],
        default: 'booked'
    },
    // Who created the booking (useful for manual admin bookings)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Details if released
    releasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    releaseReason: {
        type: String,
        default: ''
    },
    releasedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for quick lookups by date and seat (prevent double booking)
bookingSchema.index({ date: 1, seat: 1, status: 1 });
// Index for user statistics
bookingSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
