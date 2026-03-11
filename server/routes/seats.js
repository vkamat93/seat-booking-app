/**
 * Seat Routes
 * Handles seat fetching, booking, and release operations
 */

const express = require('express');
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { verifyCaptcha } = require('../utils/captchaService');

const router = express.Router();

/**
 * @route   GET /api/seats
 * @desc    Get all seats with their booking status
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all seats, sorted by row and position
    const seats = await Seat.find()
      .populate('bookedBy', 'username')
      .sort({ row: 1, position: 1 });

    res.json(seats);
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ message: 'Server error fetching seats' });
  }
});

/**
 * @route   POST /api/seats/book/:seatId
 * @desc    Book a specific seat (one seat per user)
 * @access  Private
 */
router.post('/book/:seatId', protect, async (req, res) => {

  const {captchaToken} = req.body;
  const captchaResult = await verifyCaptcha(captchaToken);
  console.log(captchaResult)

  if (!captchaResult.success || captchaResult.score < 0.5) {
    return res.status(403).json({
      message: "Our system prefers humans over robots.. Try booking from the WebApp"
    });
  }

  // Start a session for atomic transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { seatId } = req.params;
    const userId = req.user._id;

    // Check if user already has a booked seat
    const currentUser = await User.findById(userId).session(session);
    
    if (currentUser.bookedSeat) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'You already have a booked seat. Release it first to book another.' 
      });
    }

    // Find and lock the seat for update (atomic operation)
    const seat = await Seat.findById(seatId).session(session);

    if (!seat) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Seat not found' });
    }

    if (seat.status === 'booked') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'This seat is already booked' });
    }

    // Book the seat
    const bookingDate = new Date();
    seat.status = 'booked';
    seat.bookedBy = userId;
    seat.bookedAt = bookingDate;
    await seat.save({ session });

    // Update user's booked seat reference
    currentUser.bookedSeat = seat._id;
    await currentUser.save({ session });

    // Create or update booking record for history tracking
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Use findOneAndUpdate with upsert to avoid duplicate key errors
    await Booking.findOneAndUpdate(
      { seat: seat._id, date: today },
      {
        $set: {
          user: userId,
          status: 'booked',
          createdAt: bookingDate,
          releasedAt: null,
          releasedBy: null,
          releaseReason: null
        }
      },
      { upsert: true, session }
    );

    // Commit the transaction
    await session.commitTransaction();

    // Fetch updated seat with user info
    const updatedSeat = await Seat.findById(seatId).populate('bookedBy', 'username');

    res.json({
      message: 'Seat booked successfully',
      seat: updatedSeat
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error during booking' });
  } finally {
    session.endSession();
  }
});

/**
 * @route   POST /api/seats/release
 * @desc    Release the current user's booked seat
 * @access  Private
 */
router.post('/release', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    // Get user with their booked seat
    const user = await User.findById(userId).session(session);

    if (!user.bookedSeat) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'You have no seat to release' });
    }

    // Find and update the seat
    const seat = await Seat.findById(user.bookedSeat).session(session);

    if (seat) {
      // Update the booking record to 'released'
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      await Booking.updateOne(
        { user: userId, seat: seat._id, date: today, status: 'booked' },
        { 
          $set: { 
            status: 'released',
            releasedAt: new Date(),
            releaseReason: 'User released'
          }
        },
        { session }
      );

      seat.status = 'free';
      seat.bookedBy = null;
      seat.bookedAt = null;
      await seat.save({ session });
    }

    // Clear user's booked seat reference
    user.bookedSeat = null;
    await user.save({ session });

    await session.commitTransaction();

    res.json({ message: 'Seat released successfully' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Release error:', error);
    res.status(500).json({ message: 'Server error during seat release' });
  } finally {
    session.endSession();
  }
});

module.exports = router;
