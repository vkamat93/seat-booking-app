require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Seat = require('./models/Seat');
const Booking = require('./models/Booking');
const connectDB = require('./config/db');

// This mimics the logic in server/routes/seats.js
const simulateRelease = async (username) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log(`Starting simulation for user: ${username}`);
        const user = await User.findOne({ username }).session(session);
        if (!user) throw new Error('User not found');
        if (!user.bookedSeat) throw new Error('User has no booked seat');

        const seatId = user.bookedSeat;
        console.log(`User's booked seat ID: ${seatId}`);

        // 1. Update Seat
        const seat = await Seat.findById(seatId).session(session);
        if (seat) {
            console.log(`Current seat status: ${seat.status}, bookedBy: ${seat.bookedBy}`);
            seat.status = 'free';
            seat.bookedBy = null;
            seat.bookedAt = null;
            await seat.save({ session });
            console.log('Seat updated to free.');
        } else {
            console.log('Seat matching user.bookedSeat not found in Seat collection!');
        }

        // 2. Update Booking
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log(`Looking for booking on date: ${today.toISOString()}`);

        const bookingUpdateResult = await Booking.updateMany(
            {
                user: user._id,
                seat: seatId,
                date: today,
                status: 'booked'
            },
            {
                $set: {
                    status: 'released',
                    releasedBy: user._id,
                    releasedAt: new Date(),
                    releaseReason: 'Simulation release'
                }
            },
            { session }
        );
        console.log(`Booking update result: ${JSON.stringify(bookingUpdateResult)}`);

        // 3. Update User
        user.bookedSeat = null;
        await user.save({ session });
        console.log('User model cleared.');

        await session.commitTransaction();
        console.log('Transaction committed successfully!');

        // Final check outside transaction
        const finalSeat = await Seat.findById(seatId);
        const finalUser = await User.findById(user._id);
        console.log(`Final Seat Status: ${finalSeat.status}`);
        console.log(`Final User bookedSeat: ${finalUser.bookedSeat}`);

    } catch (error) {
        await session.abortTransaction();
        console.error('Simulation failed:', error.message);
    } finally {
        session.endSession();
        process.exit(0);
    }
};

const run = async () => {
    await connectDB();
    // Assuming AshishBarad has a seat from previous diagnostic
    await simulateRelease('AshishBarad');
};

run();
