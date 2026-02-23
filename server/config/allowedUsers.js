/**
 * Allowed Usernames Configuration
 * Only users in this list can register/login
 * Credentials are loaded from credentials.json file or environment variable (fallback)
 */

const fs = require('fs');
const path = require('path');

/**
 * Load credentials from JSON file or environment variable (fallback)
 * Priority: 1. credentials.json file  2. USER_CREDENTIALS env variable
 */
const loadCredentials = () => {
  const credentialsPath = path.join(__dirname, 'credentials.json');
  
  // Try loading from JSON file first
  if (fs.existsSync(credentialsPath)) {
    try {
      const fileContent = fs.readFileSync(credentialsPath, 'utf8');
      const credentials = JSON.parse(fileContent);
      console.log('✅ Loaded credentials from credentials.json');
      return credentials;
    } catch (error) {
      console.error('ERROR: Failed to parse credentials.json:', error.message);
    }
  }
  
  // Fallback to environment variable
  const credentialsJson = process.env.USER_CREDENTIALS;
  
  if (!credentialsJson) {
    console.error('WARNING: No credentials.json file or USER_CREDENTIALS env variable found!');
    return {};
  }
  
  try {
    console.log('✅ Loaded credentials from USER_CREDENTIALS env variable');
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error('ERROR: Failed to parse USER_CREDENTIALS JSON:', error.message);
    return {};
  }
};

const USER_CREDENTIALS = loadCredentials();

// Extract allowed usernames from credentials
const ALLOWED_USERNAMES = Object.keys(USER_CREDENTIALS);
console.log('📋 Allowed usernames:', ALLOWED_USERNAMES.join(', '))

/**
 * Check if a username is allowed to register/login
 * @param {string} username - Username to check
 * @returns {boolean} - True if username is allowed (case-sensitive)
 */
const isUsernameAllowed = (username) => {
  return ALLOWED_USERNAMES.includes(username);
};

/**
 * Get the default password for a specific user
 * @param {string} username - Username to get password for
 * @returns {string|null} - Default password or null if user not found (case-sensitive)
 */
const getDefaultPassword = (username) => {
  return USER_CREDENTIALS[username] || null;
};

module.exports = {
  ALLOWED_USERNAMES,
  USER_CREDENTIALS,
  isUsernameAllowed,
  getDefaultPassword
};
