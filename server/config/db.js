/**
 * Database Configuration
 * Handles MongoDB Atlas connection using Mongoose
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB Atlas connection options
    const options = {
      // Disable strict SSL (useful for development, not recommended for production)
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      // Server selection timeout
      serverSelectionTimeoutMS: 10000,
      // Socket timeout
      socketTimeoutMS: 45000,
    };

    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_PROD_URI, options);
    
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB Atlas: ${error.message}`);
    
    // Provide helpful error messages for common Atlas connection issues
    if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Could not find the MongoDB Atlas cluster. Please check your connection string.');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Authentication failed. Please check your username and password.');
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('💡 Your IP address may not be whitelisted in MongoDB Atlas.');
      console.error('   Go to: Network Access → Add IP Address → Add Current IP Address or 0.0.0.0/0');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('💡 SSL/TLS connection error. Check:');
      console.error('   1. Your connection string includes "retryWrites=true&w=majority"');
      console.error('   2. Your IP is whitelisted in MongoDB Atlas Network Access');
      console.error('   3. Your firewall/antivirus is not blocking the connection');
    }
    
    console.error('\n📝 Connection String Format:');
    console.error('   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority');
    
    process.exit(1);
  }
};

module.exports = connectDB;
