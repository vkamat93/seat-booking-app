require('dotenv').config();
const mongoose = require('mongoose');
const Seat = require('./models/Seat');
const connectDB = require('./config/db');

const checkDuplicateSeats = async () => {
    try {
        await connectDB();

        const allSeats = await Seat.find().sort({ seatNumber: 1 });
        console.log(`Total seats found: ${allSeats.length}`);

        const seatNumbers = {};
        for (const seat of allSeats) {
            if (seatNumbers[seat.seatNumber]) {
                console.log(`🛑 DUPLICATE DETECTED: Seat ${seat.seatNumber} exists twice!`);
                console.log(`   ID 1: ${seatNumbers[seat.seatNumber]}`);
                console.log(`   ID 2: ${seat._id}`);
            }
            seatNumbers[seat.seatNumber] = seat._id;
        }

        console.log('--- Seat List ---');
        allSeats.forEach(s => console.log(`${s.seatNumber}: ${s._id}`));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDuplicateSeats();
