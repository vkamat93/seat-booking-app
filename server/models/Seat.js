/**
 * Seat Model
 * Defines the schema for seats in the booking system
 */

const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  // Unique seat number (BTI-406 to BTI-417, BTI-474 to BTI-495)
  seatNumber: {
    type: Number,
    required: true,
    unique: true
  },
  // Row number (1-4 for main section, 5-10 for right cluster)
  row: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  // Position within the row (1-6)
  position: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  // Seat status: 'free' or 'booked'
  status: {
    type: String,
    enum: ['free', 'booked'],
    default: 'free'
  },
  // Reference to the user who booked this seat (null if free)
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Timestamp when the seat was booked
  bookedAt: {
    type: Date,
    default: null
  }
});

// Compound index for efficient queries
//seatSchema.index({ row: 1, position: 1 });

module.exports = mongoose.model('Seat', seatSchema);
