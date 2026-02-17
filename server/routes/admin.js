/**
 * Admin Routes
 * Handles administrative tasks: dashboard stats, user management, booking management
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const { parseDateToISTDayStart } = require('../utils/dateUtils');
const { protect, admin } = require('../middleware/auth');

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
        const { getISTDayStart } = require('../utils/dateUtils');
        const today = getISTDayStart();
        const seatsBookedToday = await Booking.countDocuments({
            date: today,
            status: 'booked'
        });

        const totalSeats = await Seat.countDocuments();
        const availableSeatsToday = await Seat.countDocuments({ status: 'free' });

        // Bookings this month
        const now = new Date();
        const { getISTMonthBoundaries } = require('../utils/dateUtils');
        const { start: startOfMonth } = getISTMonthBoundaries(now.getFullYear(), now.getMonth() + 1);

        const totalBookingsMonth = await Booking.countDocuments({
            createdAt: { $gte: startOfMonth },
            status: 'booked'
        });

        const occupancyPercentage = totalSeats > 0 ? ((totalSeats - availableSeatsToday) / totalSeats) * 100 : 0;

        res.success({
            totalUsers,
            seatsBookedToday,
            totalSeats,
            availableSeatsToday,
            totalBookingsMonth,
            occupancyPercentage: occupancyPercentage.toFixed(2)
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.error('Server error fetching stats', 'ERR_SERVER_ERROR', 500);
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortOrder = order === 'asc' ? 1 : -1;
        let sortField = sortBy;
        if (sortBy === 'todaySeat') sortField = 'todayBooking.seatInfo.seatNumber';

        const users = await User.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'bookings',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user', '$$userId'] },
                                        { $eq: ['$date', today] },
                                        { $eq: ['$status', 'booked'] }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'seats',
                                localField: 'seat',
                                foreignField: '_id',
                                as: 'seatInfo'
                            }
                        },
                        { $unwind: { path: '$seatInfo', preserveNullAndEmptyArrays: true } }
                    ],
                    as: 'todayBooking'
                }
            },
            { $unwind: { path: '$todayBooking', preserveNullAndEmptyArrays: true } },
            { $sort: { [sortField]: sortOrder } },
            { $skip: (page - 1) * limit },
            { $limit: limit * 1 },
            {
                $project: {
                    username: 1,
                    role: { $ifNull: ['$role', 'USER'] },
                    status: { $ifNull: ['$status', 'active'] },
                    createdAt: 1,
                    todaySeat: '$todayBooking.seatInfo.seatNumber'
                }
            }
        ]);

        const total = await User.countDocuments(query);

        res.success({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalUsers: total
        });
    } catch (error) {
        console.error('Admin users error:', error);
        res.error('Server error fetching users', 'ERR_SERVER_ERROR', 500);
    }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create a new user
 */
router.post('/users', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.error('User already exists', 'ERR_USER_EXISTS', 400);
        }

        const user = await User.create({
            username,
            password,
            role: role || 'USER',
            mustChangePassword: true
        });

        res.success({
            id: user._id,
            username: user.username,
            role: user.role
        }, 'User created successfully', 'SUCCESS'); // Status 201 handled via JSON code if needed, but HTTP returns 200 by default here.
    } catch (error) {
        console.error('Admin create user error:', error);
        res.error('Server error creating user', 'ERR_SERVER_ERROR', 500);
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
            return res.error('User not found', 'ERR_RESOURCE_NOT_FOUND', 404);
        }

        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();
        res.success(user, 'User updated successfully');
    } catch (error) {
        console.error('Admin update user error:', error);
        res.error('Server error updating user', 'ERR_SERVER_ERROR', 500);
    }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Soft delete user
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.error('User not found', 'ERR_RESOURCE_NOT_FOUND', 404);
        }

        user.isDeleted = true;
        await user.save();

        res.success(null, 'User deleted successfully');
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.error('Server error deleting user', 'ERR_SERVER_ERROR', 500);
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
            return res.error('User not found', 'ERR_RESOURCE_NOT_FOUND', 404);
        }

        // Generate a random 8-character temporary password
        const tempPassword = Math.random().toString(36).slice(-8);

        user.password = tempPassword;
        user.mustChangePassword = true;
        await user.save();

        res.success({
            username: user.username,
            tempPassword
        }, 'Password reset successfully');
    } catch (error) {
        console.error('Admin reset password error:', error);
        res.error('Server error resetting password', 'ERR_SERVER_ERROR', 500);
    }
});

router.get('/bookings', async (req, res) => {
    try {
        const { startDate, endDate, userId, seatId, status, sortBy = 'date', order = 'desc' } = req.query;
        const match = {};

        if (startDate || endDate) {
            match.date = {};
            if (startDate) {
                match.date.$gte = parseDateToISTDayStart(startDate);
            }
            if (endDate) {
                const eDate = parseDateToISTDayStart(endDate);
                eDate.setUTCHours(23, 59, 59, 999);
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
            { $sort: { [sortField]: sortOrder, createdAt: -1 } }
        ]);

        res.success(bookings);
    } catch (error) {
        console.error('Admin bookings error:', error);
        res.error('Server error fetching bookings', 'ERR_SERVER_ERROR', 500);
    }
});

/**
 * @route   GET /api/admin/bookings/future
 * @desc    Get all future scheduled bookings
 */
router.get('/bookings/future', async (req, res) => {
    try {
        const { getISTDayStart } = require('../utils/dateUtils');
        const today = getISTDayStart();
        today.setUTCHours(23, 59, 59, 999);

        const bookings = await Booking.find({
            date: { $gt: today },
            status: 'booked'
        })
            .populate('user', 'username')
            .populate('seat', 'seatNumber')
            .sort({ date: 1 });

        res.success(bookings);
    } catch (error) {
        console.error('Admin future bookings error:', error);
        res.error('Server error fetching future bookings', 'ERR_SERVER_ERROR', 500);
    }
});

/**
 * @route   GET /api/admin/bookings/perpetual
 * @desc    Get all permanent seat assignments
 */
router.get('/bookings/perpetual', async (req, res) => {
    try {
        const perpetualSeats = await Seat.find({ isPermanent: true })
            .populate('permanentUser', 'username');
        res.success(perpetualSeats);
    } catch (error) {
        console.error('Admin perpetual seats error:', error);
        res.error('Server error fetching perpetual seats', 'ERR_SERVER_ERROR', 500);
    }
});

/**
 * @route   POST /api/admin/bookings/perpetual
 * @desc    Assign a seat permanently to a user
 */
router.post('/bookings/perpetual', async (req, res) => {
    try {
        const { userId, seatId } = req.body;

        const seat = await Seat.findById(seatId);
        if (!seat) return res.error('Seat not found', 'ERR_RESOURCE_NOT_FOUND', 404);

        // Validation: Check for future scheduled bookings
        const { getISTDayStart } = require('../utils/dateUtils');
        const today = getISTDayStart();
        const futureBookings = await Booking.findOne({
            seat: seatId,
            date: { $gte: today },
            status: 'booked'
        });

        if (futureBookings) {
            return res.error('Cannot make seat perpetual: it has existing future bookings.', 'ERR_PERPETUAL_BOOKING_CONFLICT', 400);
        }

        seat.isPermanent = true;
        seat.permanentUser = userId;
        seat.status = 'booked';
        seat.bookedBy = userId;
        seat.bookedAt = new Date();
        await seat.save();

        // Update User
        await User.findByIdAndUpdate(userId, { bookedSeat: seatId });

        res.success(seat, 'Seat assigned permanently');
    } catch (error) {
        console.error('Admin perpetual booking error:', error);
        res.error('Server error creating perpetual booking', 'ERR_SERVER_ERROR', 500);
    }
});

/**
 * @route   DELETE /api/admin/bookings/perpetual/:seatId
 * @desc    Remove permanent status from a seat
 */
router.delete('/bookings/perpetual/:seatId', async (req, res) => {
    try {
        const seat = await Seat.findById(req.params.seatId);
        if (!seat) return res.error('Seat not found', 'ERR_RESOURCE_NOT_FOUND', 404);

        const userId = seat.permanentUser;

        seat.isPermanent = false;
        seat.permanentUser = null;
        seat.status = 'free';
        seat.bookedBy = null;
        seat.bookedAt = null;
        await seat.save();

        // Update User
        if (userId) {
            await User.findByIdAndUpdate(userId, { bookedSeat: null });
        }

        res.success(null, 'Perpetual status removed');
    } catch (error) {
        console.error('Admin delete perpetual error:', error);
        res.error('Server error removing perpetual status', 'ERR_SERVER_ERROR', 500);
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
            return res.error('No dates provided', 'ERR_MANUAL_BOOKING_DATE_MISSING', 400);
        }

        const results = [];
        const errors = [];

        for (const dateStr of dates) {
            const date = parseDateToISTDayStart(dateStr);
            if (!date) continue;

            // Validation: Check if seat is permanent
            const seat = await Seat.findById(seatId);
            if (seat && seat.isPermanent) {
                errors.push({ date: dateStr, error: 'This seat is booked everyday (perpetual). Cannot add one-off schedule.' });
                continue;
            }

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

        res.success({
            results,
            errors
        }, `Created ${results.length} bookings. ${errors.length} conflicts found.`);
    } catch (error) {
        console.error('Admin manual booking error:', error);
        res.error('Server error creating manual bookings', 'ERR_SERVER_ERROR', 500);
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
                const sDate = parseDateToISTDayStart(dateRange.start);
                const eDate = parseDateToISTDayStart(dateRange.end);
                eDate.setUTCHours(23, 59, 59, 999);
                query.date = {
                    $gte: sDate,
                    $lte: eDate
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
        const { getISTDayStart } = require('../utils/dateUtils');
        const today = getISTDayStart();

        // Find which bookings were for today and were just released
        // Status must be 'released' now. We don't use ...query because it contains status: 'booked'
        const releaseSearchQuery = {
            date: today,
            status: 'released'
        };

        if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
            releaseSearchQuery._id = { $in: bookingIds };
        } else {
            if (userId) releaseSearchQuery.user = userId;
            if (seatId) releaseSearchQuery.seat = seatId;
        }

        const updatedBookings = await Booking.find(releaseSearchQuery);

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

        res.success({ count: result.modifiedCount }, `${result.modifiedCount} bookings released successfully.`);
    } catch (error) {
        console.error('Admin mass release error:', error);
        res.error('Server error during mass release', 'ERR_SERVER_ERROR', 500);
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

        if (!month) return res.error('Month is required', 'ERR_STATS_MONTH_MISSING', 400);

        const [year, monthVal] = month.split('-').map(Number);
        const { getISTMonthBoundaries } = require('../utils/dateUtils');
        const { start: startOfMonth, end: endOfMonth } = getISTMonthBoundaries(year, monthVal);

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

        res.success({
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
        res.error('Server error fetching user stats', 'ERR_SERVER_ERROR', 500);
    }
});

module.exports = router;
