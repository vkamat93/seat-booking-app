/**
 * Admin Routes
 * Handles administrative tasks: dashboard stats, user management, booking management
 */

const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const User = require('../models/User');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const { protect, admin } = require('../middleware/auth');

// Path to credentials file
const credentialsPath = path.join(__dirname, '../config/credentials.json');

// Apply admin protection to all routes in this file
router.use(protect);
router.use(admin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard summary statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
        
        // Get seats booked today from Seat model (current state)
        const totalSeats = await Seat.countDocuments();
        const bookedSeats = await Seat.countDocuments({ status: 'booked' });
        const availableSeatsToday = totalSeats - bookedSeats;

        // For historical bookings this month, use Booking collection
        // Calculate start of month in UTC
        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));

        const totalBookingsMonth = await Booking.countDocuments({
            createdAt: { $gte: startOfMonth },
            status: 'booked'
        });

        const occupancyPercentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

        res.json({
            totalUsers,
            seatsBookedToday: bookedSeats,
            totalSeats,
            availableSeatsToday,
            totalBookingsMonth,
            occupancyPercentage: occupancyPercentage.toFixed(2)
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and search
 */
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '', status = '', sortBy = 'createdAt', order = 'desc' } = req.query;

        const query = { isDeleted: { $ne: true } };
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) query.role = role;
        if (status) query.status = status;

        const sortOrder = order === 'asc' ? 1 : -1;
        let sortField = sortBy;
        if (sortBy === 'todaySeat') sortField = 'bookedSeatInfo.seatNumber';

        const users = await User.aggregate([
            { $match: query },
            {
                // Lookup the user's currently booked seat from Seat collection
                $lookup: {
                    from: 'seats',
                    localField: 'bookedSeat',
                    foreignField: '_id',
                    as: 'bookedSeatInfo'
                }
            },
            { $unwind: { path: '$bookedSeatInfo', preserveNullAndEmptyArrays: true } },
            { $sort: { [sortField]: sortOrder } },
            { $skip: (page - 1) * limit },
            { $limit: limit * 1 },
            {
                $project: {
                    username: 1,
                    role: { $ifNull: ['$role', 'USER'] },
                    status: { $ifNull: ['$status', 'active'] },
                    createdAt: 1,
                    todaySeat: '$bookedSeatInfo.seatNumber'
                }
            }
        ]);

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalUsers: total
        });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

/**
 * @route   POST /api/admin/users
 * @desc    Add a new user to credentials.json (user will be auto-created on first login)
 */
router.post('/users', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Read current credentials
        let credentials = {};
        if (fs.existsSync(credentialsPath)) {
            const fileContent = fs.readFileSync(credentialsPath, 'utf8');
            credentials = JSON.parse(fileContent);
        }

        // Check if username already exists in credentials
        if (credentials[username]) {
            return res.status(400).json({ message: 'User already exists in credentials' });
        }

        // Also check if user exists in database
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists in Database' });
        }

        // Add new user to credentials
        credentials[username] = password;

        // Write back to credentials.json
        fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));

        // Reload credentials in allowedUsers module
        // The user will be auto-created on first login with mustChangePassword: true

        res.status(201).json({
            message: 'User added to credentials successfully. They can now login with the provided password.',
            user: {
                username,
                role: role || 'USER',
                note: 'User will be created in database on first login'
            }
        });
    } catch (error) {
        console.error('Admin create user error:', error);
        res.status(500).json({ message: 'Server error creating user' });
    }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user (role or status)
 */
router.put('/users/:id', async (req, res) => {
    try {
        const { role, status } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(500).json({ message: 'Server error updating user' });
    }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user from database only
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If user has a booked seat, release it first
        if (user.bookedSeat) {
            const seatUpdateResult = await Seat.updateOne(
                { _id: user.bookedSeat },
                {
                    $set: {
                        status: 'free',
                        bookedBy: null,
                        bookedAt: null
                    }
                }
            );
            console.log('Seat release result:', seatUpdateResult);
        }

        await User.deleteOne({ _id: req.params.id });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
});

/**
 * @route   PUT /api/admin/users/:id/reset-password
 * @desc    Reset user password to a temporary one
 */
router.put('/users/:id/reset-password', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a random 8-character temporary password
        const tempPassword = Math.random().toString(36).slice(-8);

        user.password = tempPassword;
        user.mustChangePassword = true;
        await user.save();

        res.json({
            message: 'Password reset successfully',
            username: user.username,
            tempPassword
        });
    } catch (error) {
        console.error('Admin reset password error:', error);
        res.status(500).json({ message: 'Server error resetting password' });
    }
});

router.get('/bookings', async (req, res) => {
    try {
        const { startDate, endDate, userId, seatId, status, sortBy = 'date', order = 'desc' } = req.query;
        const match = {};

        if (startDate || endDate) {
            match.date = {};
            if (startDate) {
                const sDate = new Date(startDate);
                sDate.setHours(0, 0, 0, 0);
                match.date.$gte = sDate;
            }
            if (endDate) {
                const eDate = new Date(endDate);
                eDate.setHours(23, 59, 59, 999);
                match.date.$lte = eDate;
            }
        }

        if (userId) match.user = new mongoose.Types.ObjectId(userId);
        if (seatId) match.seat = new mongoose.Types.ObjectId(seatId);
        if (status) match.status = status;

        const sortOrder = order === 'asc' ? 1 : -1;
        let sortField = sortBy;
        if (sortBy === 'user') sortField = 'user.username';
        if (sortBy === 'seat') sortField = 'seat.seatNumber';

        const bookings = await Booking.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'seats',
                    localField: 'seat',
                    foreignField: '_id',
                    as: 'seat'
                }
            },
            { $unwind: { path: '$seat', preserveNullAndEmptyArrays: true } },
            { $sort: { [sortField]: sortOrder } }
        ]);

        res.json(bookings);
    } catch (error) {
        console.error('Admin bookings error:', error);
        res.status(500).json({ message: 'Server error fetching bookings' });
    }
});

/**
 * @route   POST /api/admin/bookings/manual
 * @desc    Manually create a booking (admin)
 */
router.post('/bookings/manual', async (req, res) => {
    try {
        const { userId, seatId, dates } = req.body; // dates is an array of ISO strings

        if (!dates || !Array.isArray(dates) || dates.length === 0) {
            return res.status(400).json({ message: 'No dates provided' });
        }

        const results = [];
        const errors = [];

        for (const dateStr of dates) {
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);

            // Check for conflict
            const existing = await Booking.findOne({
                seat: seatId,
                date,
                status: 'booked'
            });

            if (existing) {
                errors.push({ date: dateStr, error: 'Seat already booked for this date' });
                continue;
            }

            const booking = await Booking.create({
                user: userId,
                seat: seatId,
                date,
                status: 'booked',
                createdBy: req.user._id
            });

            results.push(booking);
        }

        res.json({
            message: `Created ${results.length} bookings. ${errors.length} conflicts found.`,
            results,
            errors
        });
    } catch (error) {
        console.error('Admin manual booking error:', error);
        res.status(500).json({ message: 'Server error creating manual bookings' });
    }
});

/**
 * @route   POST /api/admin/bookings/release
 * @desc    Mass release bookings
 */
router.post('/bookings/release', async (req, res) => {
    try {
        const { userId, dateRange, seatId, bookingIds } = req.body;
        const query = { status: 'booked' };

        if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
            query._id = { $in: bookingIds };
        } else {
            if (userId) query.user = userId;
            if (seatId) query.seat = seatId;
            if (dateRange) {
                query.date = {
                    $gte: new Date(dateRange.start),
                    $lte: new Date(dateRange.end)
                };
            }
        }

        const result = await Booking.updateMany(query, {
            $set: {
                status: 'released',
                releasedBy: req.user._id,
                releasedAt: new Date(),
                releaseReason: bookingIds ? 'Admin selection release' : 'Admin mass release'
            }
        });

        // Also update current seat status if it was released for TODAY
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find which bookings were for today and were just released
        const updatedBookings = await Booking.find({
            ...query,
            date: today,
            status: 'released'
        });

        if (updatedBookings.length > 0) {
            const seatIds = updatedBookings.map(b => b.seat);
            const userIds = updatedBookings.map(b => b.user);

            // Free the seats
            await Seat.updateMany(
                { _id: { $in: seatIds } },
                {
                    $set: {
                        status: 'free',
                        bookedBy: null,
                        bookedAt: null
                    }
                }
            );

            // Clear user references
            await User.updateMany(
                { _id: { $in: userIds } },
                { $set: { bookedSeat: null } }
            );
        }

        res.json({
            message: `${result.modifiedCount} bookings released successfully.`,
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('Admin mass release error:', error);
        res.status(500).json({ message: 'Server error during mass release' });
    }
});

/**
 * @route   GET /api/admin/users/:id/stats
 * @desc    Get detailed user statistics for a specific month
 */
router.get('/users/:id/stats', async (req, res) => {
    try {
        const { month } = req.query; // YYYY-MM
        const userId = req.params.id;

        if (!month) return res.status(400).json({ message: 'Month is required' });

        const [year, monthVal] = month.split('-').map(Number);
        const startOfMonth = new Date(year, monthVal - 1, 1);
        const endOfMonth = new Date(year, monthVal, 0, 23, 59, 59, 999);

        const bookings = await Booking.find({
            user: userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).populate('seat', 'seatNumber');

        const totalBooked = bookings.filter(b => b.status === 'booked').length;
        const totalCancelled = bookings.filter(b => b.status === 'released').length;

        // Find most used seat
        const seatCounts = {};
        bookings.forEach(b => {
            if (b.status === 'booked' && b.seat) {
                const num = b.seat.seatNumber;
                seatCounts[num] = (seatCounts[num] || 0) + 1;
            }
        });

        let mostFreqSeat = null;
        let maxCount = 0;
        for (const seat in seatCounts) {
            if (seatCounts[seat] > maxCount) {
                maxCount = seatCounts[seat];
                mostFreqSeat = seat;
            }
        }

        res.json({
            totalBooked,
            totalCancelled,
            attendancePercentage: totalBooked + totalCancelled > 0 ? (totalBooked / (totalBooked + totalCancelled)) * 100 : 0,
            mostFreqSeat,
            bookings: bookings.map(b => ({
                date: b.date,
                status: b.status,
                seatNumber: b.seat?.seatNumber
            }))
        });
    } catch (error) {
        console.error('Admin user stats error:', error);
        res.status(500).json({ message: 'Server error fetching user stats' });
    }
});

module.exports = router;