/**
 * Sync Users from Whitelist
 * Utility script to import all users from USER_CREDENTIALS into the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
const { USER_CREDENTIALS } = require('./config/allowedUsers');

const syncUsers = async () => {
    try {
        await connectDB();

        const usernames = Object.keys(USER_CREDENTIALS);
        console.log(`Found ${usernames.length} users in whitelist.`);

        let createdCount = 0;
        let existingCount = 0;

        for (const username of usernames) {
            const existingUser = await User.findOne({ username });

            if (!existingUser) {
                await User.create({
                    username,
                    password: USER_CREDENTIALS[username],
                    mustChangePassword: true,
                    role: 'USER' // Default to USER, can be promoted later
                });
                createdCount++;
            } else {
                existingCount++;
            }
        }

        console.log(`Sync complete:`);
        console.log(` - Created: ${createdCount}`);
        console.log(` - Already existed: ${existingCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Error syncing users:', error);
        process.exit(1);
    }
};

syncUsers();
