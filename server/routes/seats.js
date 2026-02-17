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
const { getISTDayStart } = require('../utils/dateUtils');

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

    res.success(seats);
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.error('Server error fetching seats', 'ERR_SERVER_ERROR', 500);
  }
});

/**
 * @route   POST /api/seats/book/:seatId
 * @desc    Book a specific seat (one seat per user)
 * @access  Private
 */
router.post('/book/:seatId', protect, async (req, res) => {
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
      return res.error('You already have a booked seat. Release it first to book another.', 'ERR_USER_ALREADY_HAS_SEAT', 400);
    }

    // Find and lock the seat for update (atomic operation)
    const seat = await Seat.findById(seatId).session(session);

    if (!seat) {
      await session.abortTransaction();
      return res.error('Seat not found', 'ERR_RESOURCE_NOT_FOUND', 404);
    }

    if (seat.status === 'booked') {
      await session.abortTransaction();
      return res.error('This seat is already booked', 'ERR_SEAT_ALREADY_BOOKED', 400);
    }

    // Book the seat
    seat.status = 'booked';
    seat.bookedBy = userId;
    seat.bookedAt = new Date();
    await seat.save({ session });

    // Update user's booked seat reference
    currentUser.bookedSeat = seat._id;
    await currentUser.save({ session });

    // Create a Booking record for today
    const today = getISTDayStart();

    await Booking.create([{
      user: userId,
      seat: seatId,
      date: today,
      status: 'booked',
      createdBy: userId
    }], { session });

    // Commit the transaction
    await session.commitTransaction();

    // Fetch updated seat with user info
    const updatedSeat = await Seat.findById(seatId).populate('bookedBy', 'username');

    res.success({
      seat: updatedSeat
    }, 'Seat booked successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('Booking error:', error);
    res.error('Server error during booking', 'ERR_SERVER_ERROR', 500);
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
      return res.error('You have no seat to release', 'ERR_NO_SEAT_TO_RELEASE', 400);
    }

    // Find and update the seat
    const seat = await Seat.findById(user.bookedSeat).session(session);

    if (seat) {
      seat.status = 'free';
      seat.bookedBy = null;
      seat.bookedAt = null;
      await seat.save({ session });
    }

    // Update the Booking record for today
    const today = getISTDayStart();

    await Booking.updateMany(
      {
        user: userId,
        seat: user.bookedSeat,
        date: today,
        status: 'booked'
      },
      {
        $set: {
          status: 'released',
          releasedBy: userId,
          releasedAt: new Date(),
          releaseReason: 'User self-release'
        }
      },
      { session }
    );

    // Clear user's booked seat reference
    user.bookedSeat = null;
    await user.save({ session });

    await session.commitTransaction();

    res.success(null, 'Seat released successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('Release error:', error);
    res.error('Server error during seat release', 'ERR_SERVER_ERROR', 500);
  } finally {
    session.endSession();
  }
});

module.exports = router;
