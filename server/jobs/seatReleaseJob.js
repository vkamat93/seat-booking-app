/**
 * Seat Release Cron Job
 * Automatically releases all seats at 1:00 AM every day
 */

const cron = require('node-cron');
const Seat = require('../models/Seat');
const User = require('../models/User');

/**
 * Release all booked seats and clear user references
 * This function is called by the cron job at 1:00 AM
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
 * Initialize the cron job
 * Schedule: '0 1 * * *' = At 01:00 (1:00 AM) every day
 * 
 * Cron format: 'second minute hour day-of-month month day-of-week'
 * 0 1 * * * means:
 *   - 0: at minute 0
 *   - 1: at hour 1 (1 AM)
 *   - *: every day of the month
 *   - *: every month
 *   - *: every day of the week
 */
const initSeatReleaseJob = () => {
  // Schedule job for 1:00 AM every day
  const job = cron.schedule('35 1 * * *', async () => {
    await releaseAllSeats();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Adjust timezone as needed
  });

  console.log('Seat release cron job scheduled for 1:35 AM daily');
  
  return job;
};

module.exports = {
  initSeatReleaseJob,
  releaseAllSeats // Export for manual triggering if needed
};
