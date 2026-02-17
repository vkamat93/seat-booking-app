/**
 * Promote User to ADMIN
 * Utility script to grant admin privileges to a user
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const promoteUser = async (username) => {
    try {
        await connectDB();

        const user = await User.findOne({ username });
        if (!user) {
            console.error(`User '${username}' not found`);
            process.exit(1);
        }

        user.role = 'ADMIN';
        await user.save();

        console.log(`Successfully promoted ${username} to ADMIN`);
        process.exit(0);
    } catch (error) {
        console.error('Error promoting user:', error);
        process.exit(1);
    }
};

const username = process.argv[2];
if (!username) {
    console.log('Usage: node promoteAdmin.js <username>');
    process.exit(1);
}

promoteUser(username);
