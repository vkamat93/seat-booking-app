require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const auditUsers = async () => {
    try {
        await connectDB();
        const allUsers = await User.find({});
        console.log(`Total users in DB (including deleted): ${allUsers.length}`);

        const nonDeleted = allUsers.filter(u => !u.isDeleted);
        console.log(`Non-deleted users: ${nonDeleted.length}`);

        const deleted = allUsers.filter(u => u.isDeleted);
        console.log(`Deleted users: ${deleted.length}`);

        const sample = allUsers.slice(0, 5).map(u => ({
            username: u.username,
            role: u.role,
            status: u.status,
            isDeleted: u.isDeleted
        }));
        console.log('Sample users:', JSON.stringify(sample, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

auditUsers();
