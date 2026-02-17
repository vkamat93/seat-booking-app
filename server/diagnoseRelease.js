require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Seat = require('./models/Seat');
const Booking = require('./models/Booking');
const connectDB = require('./config/db');

const checkReleaseIssue = async () => {
    try {
        await connectDB();

        console.log('--- Checking for Booked Seats ---');
        const bookedSeats = await Seat.find({ status: 'booked' }).populate('bookedBy', 'username');
        console.log(`Found ${bookedSeats.length} booked seats.`);

        for (const seat of bookedSeats) {
            console.log(`\nSeat: ${seat.seatNumber} (${seat._id})`);
            console.log(`Booked By User: ${seat.bookedBy ? seat.bookedBy.username : 'NULL'} (${seat.bookedBy ? seat.bookedBy._id : 'NULL'})`);

            if (seat.bookedBy) {
                const user = await User.findById(seat.bookedBy._id);
                console.log(`User.bookedSeat: ${user.bookedSeat}`);
                if (String(user.bookedSeat) !== String(seat._id)) {
                    console.log('⚠️ INCONSISTENCY: User.bookedSeat does not match Seat._id');
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const booking = await Booking.findOne({
                    user: user._id,
                    seat: seat._id,
                    date: today,
                    status: 'booked'
                });
                console.log(`Booking for today exists: ${!!booking}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkReleaseIssue();
