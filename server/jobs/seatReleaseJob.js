/**
 * Seat Release Cron Job
 * Automatically releases all seats at 1:35 AM every day
 * Then allocates seat 495 to a specific user
 */

const cron = require('node-cron');
const Seat = require('../models/Seat');
const User = require('../models/User');

// Unit Titan who gets seat 495 automatically
const AUTO_ALLOCATE_USERNAME = 'AbhishekSunder'; // Change this to the desired username
const AUTO_ALLOCATE_SEAT_NUMBER = 495;

/**
 * Release all booked seats and clear user references
 * This function is called by the cron job at 1:35 AM
 */
const releaseAllSeats = async () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting scheduled seat release...`);

  try {
    // Reset all seats to free
    const seatResult = await Seat.updateMany(
      { status: 'booked' },
      {
        $set: {
          status: 'free',
          bookedBy: null,
          bookedAt: null
        }
      }
    );

    // Clear all user booked seat references
    const userResult = await User.updateMany(
      { bookedSeat: { $ne: null } },
      { $set: { bookedSeat: null } }
    );

    console.log(`[${timestamp}] Seat release complete:`);
    console.log(`  - Seats released: ${seatResult.modifiedCount}`);
    console.log(`  - Users updated: ${userResult.modifiedCount}`);

    return {
      success: true,
      seatsReleased: seatResult.modifiedCount,
      usersUpdated: userResult.modifiedCount
    };
  } catch (error) {
    console.error(`[${timestamp}] Error during seat release:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Allocate a specific seat to a specific user
 * Called after seat release to reserve seat 495 for a particular user
 */
const allocateSeatToUser = async (username, seatNumber) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting auto-allocation of seat ${seatNumber} to ${username}...`);

  try {
    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`[${timestamp}] User '${username}' not found. Skipping auto-allocation.`);
      return { success: false, error: 'User not found' };
    }

    // Find the seat
    const seat = await Seat.findOne({ seatNumber });
    if (!seat) {
      console.log(`[${timestamp}] Seat ${seatNumber} not found. Skipping auto-allocation.`);
      return { success: false, error: 'Seat not found' };
    }

    // Check if seat is already booked
    if (seat.status === 'booked') {
      console.log(`[${timestamp}] Seat ${seatNumber} is already booked. Skipping auto-allocation.`);
      return { success: false, error: 'Seat already booked' };
    }

    // Book the seat for the user
    seat.status = 'booked';
    seat.bookedBy = user._id;
    seat.bookedAt = new Date();
    await seat.save();

    // Update user's booked seat reference
    user.bookedSeat = seat._id;
    await user.save();

    console.log(`[${timestamp}] Auto-allocation complete: Seat ${seatNumber} allocated to ${username}`);

    return {
      success: true,
      seatNumber,
      username
    };
  } catch (error) {
    console.error(`[${timestamp}] Error during auto-allocation:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Initialize the cron jobs
 * Schedule: '35 1 * * *' = At 01:35 AM every day
 * 
 * Cron format: 'minute hour day-of-month month day-of-week'
 * 35 1 * * * means:
 *   - 35: at minute 35
 *   - 1: at hour 1 (1 AM)
 *   - *: every day of the month
 *   - *: every month
 *   - *: every day of the week
 */
const initSeatReleaseJob = () => {
  // Schedule job for 1:35 AM every day - releases all seats then allocates seat 495
  const job = cron.schedule('35 1 * * *', async () => {
    // First, release all seats
    await releaseAllSeats();
    
    // Then, allocate seat 495 to the specified user
    await allocateSeatToUser(AUTO_ALLOCATE_USERNAME, AUTO_ALLOCATE_SEAT_NUMBER);
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Adjust timezone as needed
  });

  console.log(`Seat release cron job scheduled for 1:35 AM daily`);
  console.log(`Auto-allocation: Seat ${AUTO_ALLOCATE_SEAT_NUMBER} will be allocated to '${AUTO_ALLOCATE_USERNAME}' after release`);
  
  return job;
};

module.exports = {
  initSeatReleaseJob,
  releaseAllSeats // Export for manual triggering if needed
};
