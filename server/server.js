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
      let seatNumber = 474;
      
      // Create 2 rows of 6 seats each
      for (let row = 1; row <= 2; row++) {
        for (let position = 1; position <= 6; position++) {
          seats.push({
            seatNumber,
            row,
            position,
            status: 'free',
            bookedBy: null,
            bookedAt: null
          });
          seatNumber++;
        }
      }
      
      await Seat.insertMany(seats);
      console.log('Created 12 seats (2 rows × 6 seats)');
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
