/**
 * Database Configuration
 * Handles MongoDB Atlas connection using Mongoose
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const initializeSeats = require('../utils/dbInit');

let currentEnv = process.env.DATABASE_ENV || 'staging';

const getEnv = () => currentEnv;

/**
 * Persistently save the environment choice to the .env file
 */
const saveEnvToEnvFile = (env) => {
  try {
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) return;

    let envContent = fs.readFileSync(envPath, 'utf8');
    const regex = /^DATABASE_ENV=.*$/m;

    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `DATABASE_ENV=${env}`);
    } else {
      envContent += `\nDATABASE_ENV=${env}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Saved DATABASE_ENV=${env} to .env file`);
  } catch (error) {
    console.error('❌ Failed to save environment to .env:', error.message);
  }
};

const connectDB = async () => {
  const uri = currentEnv === 'prod' ? process.env.MONGODB_PROD_URI : process.env.MONGODB_STAGING_URI;

  if (!uri) {
    console.error(`❌ Error: MONGODB_${currentEnv.toUpperCase()}_URI is not defined in .env`);
    process.exit(1);
  }

  try {
    const options = {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log(`Connecting to MongoDB Atlas (${currentEnv})...`);
    const conn = await mongoose.connect(uri, options);

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name} (${currentEnv})`);

    // Ensure seats are initialized for this environment
    await initializeSeats();
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB Atlas: ${error.message}`);
    process.exit(1);
  }
};

const switchEnv = async (newEnv) => {
  if (newEnv === currentEnv) return;

  console.log(`🔄 Switching environment to: ${newEnv}`);
  await mongoose.disconnect();
  currentEnv = newEnv;
  saveEnvToEnvFile(newEnv); // Persist to .env
  await connectDB();
};

module.exports = { connectDB, getEnv, switchEnv };
