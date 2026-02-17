/**
 * Seat Release Cron Job
 * Automatically releases all seats at 1:35 AM every day
 * Then allocates seat 495 to a specific user
 */

const cron = require('node-cron');
const Seat = require('../models/Seat');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { getISTDayStart } = require('../utils/dateUtils');

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
    // Reset all seats to free EXCEPT those marked as permanent
    const seatResult = await Seat.updateMany(
      { status: 'booked', isPermanent: { $ne: true } },
      {
        $set: {
          status: 'free',
          bookedBy: null,
          bookedAt: null
        }
      }
    );

    // Clear user booked seat references EXCEPT for those holding permanent seats
    const permanentSeats = await Seat.find({ isPermanent: true }).select('permanentUser');
    const permanentUserIds = permanentSeats.map(s => s.permanentUser);

    const userResult = await User.updateMany(
      {
        bookedSeat: { $ne: null },
        _id: { $nin: permanentUserIds }
      },
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
// allocateSeatToUser removed - using database-driven applyScheduledBookings

/**
 * Automatically apply all scheduled bookings for today
 */
const applyScheduledBookings = async () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting application of scheduled bookings...`);

  try {
    const today = getISTDayStart();

    // 1. Log permanent seats for today's stats
    const permanentSeats = await Seat.find({ isPermanent: true });
    let permanentCount = 0;
    for (const seat of permanentSeats) {
      if (seat.permanentUser) {
        await Booking.findOneAndUpdate(
          { date: today, seat: seat._id },
          {
            user: seat.permanentUser,
            status: 'booked',
            createdBy: seat.permanentUser // System log
          },
          { upsert: true }
        );
        permanentCount++;
      }
    }

    // 2. Find all 'booked' records for today
    const scheduledBookings = await Booking.find({
      date: today,
      status: 'booked'
    });

    console.log(`[${timestamp}] Found ${scheduledBookings.length} scheduled bookings for today. ${permanentCount} permanent seats logged.`);

    let successCount = 0;
    for (const booking of scheduledBookings) {
      try {
        // Skip if seat is permanent (already handled or blocked)
        const seat = await Seat.findById(booking.seat);
        if (seat && seat.isPermanent) continue;

        // Update Seat
        await Seat.findByIdAndUpdate(booking.seat, {
          $set: {
            status: 'booked',
            bookedBy: booking.user,
            bookedAt: new Date()
          }
        });

        // Update User
        await User.findByIdAndUpdate(booking.user, {
          $set: { bookedSeat: booking.seat }
        });

        successCount++;
      } catch (err) {
        console.error(`[${timestamp}] Failed to apply booking ${booking._id}:`, err);
      }
    }

    console.log(`[${timestamp}] Successfully applied ${successCount}/${scheduledBookings.length} scheduled bookings.`);
    return { success: true, count: successCount };
  } catch (error) {
    console.error(`[${timestamp}] Error during applying scheduled bookings:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize the cron jobs
 * Schedule: '35 1 * * *' = At 01:35 AM every day
 */
const initSeatReleaseJob = () => {
  // Schedule job for 1:35 AM every day
  const job = cron.schedule('35 1 * * *', async () => {
    // 1. Release all seats (ignoring permanent ones)
    await releaseAllSeats();

    // 2. Apply all scheduled bookings and log permanent seats
    await applyScheduledBookings();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });

  console.log(`Seat release cron job scheduled for 1:35 AM daily`);

  return job;
};

module.exports = {
  initSeatReleaseJob,
  releaseAllSeats,
  applyScheduledBookings // Export for testing
};
