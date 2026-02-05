/**
 * Seat Booking Application - Main Server File
 * Express server with MongoDB connection and cron job initialization
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const seatRoutes = require('./routes/seats');
const { initSeatReleaseJob } = require('./jobs/seatReleaseJob');
const Seat = require('./models/Seat');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/seats', seatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Initialize seats in the database if they don't exist
 * Creates 10 seats: 2 rows × 5 seats per row
 */
const initializeSeats = async () => {
  try {
    const existingSeats = await Seat.countDocuments();
    
    if (existingSeats === 0) {
      console.log('Initializing seats...');
      
      const seats = [];
      
      /**
       * Office Layout:
       * 
       * Main Section:                          Right Cluster:
       * [▮][491][492][493][494][495][▮]        [417][412] | [411][406]
       * [▮][490][489][488][487][486][▮]        [416][413] | [410][407]
       * ─────────────────────────              [415][414] | [409][408]
       * [480][481][482][483][484][485]
       * [479][478][477][476][475][474]
       */
      
      // Bottom section - Row 1 (seats 474-479)
      [474, 475, 476, 477, 478, 479].forEach((seatNum, idx) => {
        seats.push({
          seatNumber: seatNum,
          row: 1,
          position: idx + 1,
          status: 'free',
          bookedBy: null,
          bookedAt: null
        });
      });
      
      // Bottom section - Row 2 (seats 480-485)
      [480, 481, 482, 483, 484, 485].forEach((seatNum, idx) => {
        seats.push({
          seatNumber: seatNum,
          row: 2,
          position: idx + 1,
          status: 'free',
          bookedBy: null,
          bookedAt: null
        });
      });
      
      // Top section - Row 3 (seats 486-490)
      [486, 487, 488, 489, 490].forEach((seatNum, idx) => {
        seats.push({
          seatNumber: seatNum,
          row: 3,
          position: idx + 1,
          status: 'free',
          bookedBy: null,
          bookedAt: null
        });
      });
      
      // Top section - Row 4 (seats 491-495)
      [491, 492, 493, 494, 495].forEach((seatNum, idx) => {
        seats.push({
          seatNumber: seatNum,
          row: 4,
          position: idx + 1,
          status: 'free',
          bookedBy: null,
          bookedAt: null
        });
      });
      
      // Right cluster - Row 5 (seats 406-408, 409-411)
      [411, 406].forEach((seatNum, idx) => {
        seats.push({
          seatNumber: seatNum,
          row: 5,
          position: idx + 1,
          status: 'free',
          bookedBy: null,
          bookedAt: null
        });
      });
      
      // Right cluster - Row 6 (seats 410, 407)
      [410, 407].forEach((seatNum, idx) => {
        seats.push({
          seatNumber: seatNum,
          row: 6,
          position: idx + 1,
          status: 'free',
          bookedBy: null,
          bookedAt: null
        });
      });
      
      // Right cluster - Row 7 (seats 409, 408)
      [409, 408].forEach((seatNum, idx) => {
        seats.push({
          seatNumber: seatNum,
          row: 7,
          position: idx + 1,
          status: 'free',
          bookedBy: null,
          bookedAt: null
        });
      });
      
      // Right cluster - Row 8 (seats 417, 412)
      [417, 412].forEach((seatNum, idx) => {
        seats.push({
          seatNumber: seatNum,
          row: 8,
          position: idx + 1,
          status: 'free',
          bookedBy: null,
          bookedAt: null
        });
      });
      
      // Right cluster - Row 9 (seats 416, 413)
      [416, 413].forEach((seatNum, idx) => {
        seats.push({
          seatNumber: seatNum,
          row: 9,
          position: idx + 1,
          status: 'free',
          bookedBy: null,
          bookedAt: null
        });
      });
      
      // Right cluster - Row 10 (seats 415, 414)
      [415, 414].forEach((seatNum, idx) => {
        seats.push({
          seatNumber: seatNum,
          row: 10,
          position: idx + 1,
          status: 'free',
          bookedBy: null,
          bookedAt: null
        });
      });
      
      await Seat.insertMany(seats);
      console.log('Created 34 seats (main: 6+6+5+5, right cluster: 12 seats)');
    } else {
      console.log(`Found ${existingSeats} existing seats in database`);
    }
  } catch (error) {
    console.error('Error initializing seats:', error);
  }
};

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize seats if needed
    await initializeSeats();
    
    // Initialize the cron job for seat release at xx:xx AM
    initSeatReleaseJob();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
