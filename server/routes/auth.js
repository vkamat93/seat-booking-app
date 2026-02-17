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
      return res.error('Please provide username and password', 'ERR_LOGIN_MISSING_CREDENTIALS', 400);
    }

    // Check if username is in the allowed list (case-sensitive)
    if (!isUsernameAllowed(username)) {
      return res.error('Username not authorized. Please contact administrator.', 'ERR_AUTH_USERNAME_UNAUTHORIZED', 403);
    }

    // Find user by username (include password for comparison)
    let user = await User.findOne({ username }).select('+password');

    // If user doesn't exist and username is allowed, auto-create with default password
    if (!user) {
      // Get the unique default password for this user
      const defaultPassword = getDefaultPassword(username);

      // Only allow login with the user's default password for new users
      if (password !== defaultPassword) {
        return res.error('Invalid credentials', 'ERR_LOGIN_INVALID_DEFAULT_PASSWORD', 401);
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
      return res.error('Invalid credentials', 'ERR_LOGIN_INVALID_CREDENTIALS', 401);
    }

    // Generate token and respond
    const token = generateToken(user._id);

    res.success({
      _id: user._id,
      username: user.username,
      role: user.role,
      bookedSeat: user.bookedSeat,
      mustChangePassword: user.mustChangePassword,
      token
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    res.error('Server error during login', 'ERR_AUTH_LOGIN_SERVER_ERROR', 500);
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

    res.success({
      _id: user._id,
      username: user.username,
      role: user.role,
      bookedSeat: user.bookedSeat,
      mustChangePassword: user.mustChangePassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.error('Server error', 'ERR_AUTH_ME_SERVER_ERROR', 500);
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
      return res.error('Please provide current and new password', 'ERR_CHANGE_PASS_FIELDS_MISSING', 400);
    }

    if (newPassword.length < 6) {
      return res.error('New password must be at least 6 characters', 'ERR_CHANGE_PASS_TOO_SHORT', 400);
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.error('Current password is incorrect', 'ERR_INVALID_PASSWORD', 401);
    }

    // Update password and set mustChangePassword to false
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.success({
      mustChangePassword: false
    }, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    res.error('Server error during password change', 'ERR_AUTH_CHANGE_PASSWORD_SERVER_ERROR', 500);
  }
});

module.exports = router;
