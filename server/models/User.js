/**
 * User Model
 * Defines the schema for user accounts with authentication
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Unique username for display
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  // Hashed password (never store plain text!)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  // Reference to the seat booked by this user (null if none)
  bookedSeat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Pre-save middleware to hash password before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash if password is modified (or new)
  if (!this.isModified('password')) {
    return next();
  }
  
  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Method to compare entered password with hashed password
 * @param {string} enteredPassword - The password to check
 * @returns {boolean} - True if passwords match
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
