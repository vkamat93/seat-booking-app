/**
 * Authentication Routes
 * Handles user login and profile retrieval
 * Registration is disabled - users are auto-created on first login with default password
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seat = require('../models/Seat');
const { protect } = require('../middleware/auth');
const { isUsernameAllowed, getDefaultPassword } = require('../config/allowedUsers');

const router = express.Router();

/**
 * Generate JWT Token
 * @param {string} id - User ID to encode in token
 * @returns {string} - JWT token valid for 11 hours (forces daily re-login)
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '11h'
  });
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 *          Auto-creates user on first login if username is allowed
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Check if username is in the allowed list (case-sensitive)
    if (!isUsernameAllowed(username)) {
      return res.status(403).json({ message: 'Username not authorized. Please contact administrator.' });
    }

    // Find user by username (include password for comparison)
    let user = await User.findOne({ username }).select('+password');

    // If user doesn't exist and username is allowed, auto-create with default password
    if (!user) {
      // Get the unique default password for this user
      const defaultPassword = getDefaultPassword(username);
      
      // Only allow login with the user's default password for new users
      if (password !== defaultPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Create new user with their unique default password
      user = await User.create({
        username,
        password: defaultPassword,
        mustChangePassword: true
      });
      
      // Reload user with password for token generation
      user = await User.findById(user._id).select('+password');
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token and respond
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      bookedSeat: user.bookedSeat,
      mustChangePassword: user.mustChangePassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    // Get user with populated seat info
    const user = await User.findById(req.user._id).populate('bookedSeat');
    
    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      bookedSeat: user.bookedSeat,
      mustChangePassword: user.mustChangePassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password (required for first-time login)
 * @access  Private
 */
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password and set mustChangePassword to false
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ 
      message: 'Password changed successfully',
      mustChangePassword: false
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

/**
 * @route   POST /api/auth/reset-with-default
 * @desc    Reset user password using default credentials from credentials.json
 *          Deletes existing user record and creates a new one
 * @access  Public
 */
router.post('/reset-with-default', async (req, res) => {
  try {
    const { username, defaultPassword } = req.body;

    // Validate input
    if (!username || !defaultPassword) {
      return res.status(400).json({ message: 'Please provide username and default password' });
    }

    // Check if username is in the allowed list (credentials.json)
    if (!isUsernameAllowed(username)) {
      return res.status(403).json({ message: 'Username not authorized. Please contact administrator.' });
    }

    // Get the default password from credentials.json
    const storedDefaultPassword = getDefaultPassword(username);

    // Verify the provided default password matches credentials.json
    if (defaultPassword !== storedDefaultPassword) {
      return res.status(401).json({ message: 'Invalid default password. Please contact administrator.' });
    }

    // Find existing user
    const existingUser = await User.findOne({ username });

    // Store the booked seat ID if the user had a booking
    let bookedSeatId = null;

    if (existingUser) {
      // Check if user had a booked seat
      bookedSeatId = existingUser.bookedSeat;
      
      // Delete the existing user record
      await User.deleteOne({ _id: existingUser._id });
      console.log(`Reset password: Deleted existing user record for ${username}`);
    }

    // Create new user with default password and mustChangePassword: true
    const newUser = await User.create({
      username,
      password: storedDefaultPassword,
      mustChangePassword: true,
      bookedSeat: bookedSeatId // Transfer the seat booking to new user
    });

    // If user had a booked seat, update the seat's bookedBy to point to new user
    if (bookedSeatId) {
      await Seat.findByIdAndUpdate(bookedSeatId, { bookedBy: newUser._id });
      console.log(`Reset password: Transferred seat booking to new user record for ${username}`);
    }

    console.log(`Reset password: Created new user record for ${username}`);

    // Generate token for the new user
    const token = generateToken(newUser._id);

    res.json({
      message: 'Password reset successful. Please set a new password.',
      _id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      mustChangePassword: true,
      token
    });
  } catch (error) {
    console.error('Reset with default password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;
