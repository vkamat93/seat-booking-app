/**
 * Sync Active Bookings
 * Utility script to migrate current "live" bookings from Seat model to Booking model for today
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Seat = require('./models/Seat');
const Booking = require('./models/Booking');
const connectDB = require('./config/db');
const { getISTDayStart } = require('./utils/dateUtils');

const syncBookings = async () => {
    try {
        await connectDB();

        // Find all booked seats
        const bookedSeats = await Seat.find({ status: 'booked' });
        console.log(`Found ${bookedSeats.length} active seat bookings.`);

        const today = getISTDayStart();

        let createdCount = 0;
        let skippedCount = 0;

        for (const seat of bookedSeats) {
            if (!seat.bookedBy) continue;

            // Check if a booking already exists for this seat/user/date
            const existing = await Booking.findOne({
                seat: seat._id,
                user: seat.bookedBy,
                date: today,
                status: 'booked'
            });

            if (!existing) {
                await Booking.create({
                    user: seat.bookedBy,
                    seat: seat._id,
                    date: today,
                    status: 'booked',
                    createdBy: seat.bookedBy, // Assume self-booked if not specified
                    createdAt: seat.bookedAt || new Date()
                });
                createdCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`Booking sync complete:`);
        console.log(` - Created: ${createdCount}`);
        console.log(` - Already existed: ${skippedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Error syncing bookings:', error);
        process.exit(1);
    }
};

syncBookings();
