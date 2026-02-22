/**
 * Seat Booking Application - Main Server File
 * Express server with MongoDB connection and cron job initialization
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const seatRoutes = require('./routes/seats');
const adminRoutes = require('./routes/admin');
const responsePlugin = require('./middleware/responsePlugin');
const { initSeatReleaseJob } = require('./jobs/seatReleaseJob');
const initializeSeats = require('./utils/dbInit');
const Seat = require('./models/Seat');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(responsePlugin);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
