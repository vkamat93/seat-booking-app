/**
 * Authentication Routes
 * Handles user login and profile retrieval
 * Registration is disabled - users are auto-created on first login with default password
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isUsernameAllowed, getDefaultPassword } = require('../config/allowedUsers');

const router = express.Router();

/**
 * Generate JWT Token
 * @param {string} id - User ID to encode in token
 * @returns {string} - JWT token valid for 7 days
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
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

    // Check if username is in the allowed list
    if (!isUsernameAllowed(username)) {
      return res.status(403).json({ message: 'Username not authorized. Please contact administrator.' });
    }

    // Find user by username (include password for comparison)
    let user = await User.findOne({ username: username.toLowerCase() }).select('+password');

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
        username: username.toLowerCase(),
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

module.exports = router;
