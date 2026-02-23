/**
 * Allowed Usernames Configuration
 * Only users in this list can register/login
 * Credentials are loaded from credentials.json file or environment variable (fallback)
 * Credentials are re-read on each check to support dynamic user creation
 */

const fs = require('fs');
const path = require('path');

const credentialsPath = path.join(__dirname, 'credentials.json');

/**
 * Load credentials from JSON file or environment variable (fallback)
 * Called on each check to support dynamic user creation via admin panel
 * Priority: 1. credentials.json file  2. USER_CREDENTIALS env variable
 */
const loadCredentials = () => {
  // Try loading from JSON file first
  if (fs.existsSync(credentialsPath)) {
    try {
      const fileContent = fs.readFileSync(credentialsPath, 'utf8');
      return JSON.parse(fileContent);
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
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error('ERROR: Failed to parse USER_CREDENTIALS JSON:', error.message);
    return {};
  }
};

// Log initial load
const initialCredentials = loadCredentials();
console.log('✅ Loaded credentials from credentials.json');
console.log('📋 Allowed usernames:', Object.keys(initialCredentials).join(', '));

/**
 * Check if a username is allowed to register/login
 * Re-reads credentials file to support dynamic user creation
 * @param {string} username - Username to check
 * @returns {boolean} - True if username is allowed (case-sensitive)
 */
const isUsernameAllowed = (username) => {
  const credentials = loadCredentials();
  return Object.keys(credentials).includes(username);
};

/**
 * Get the default password for a specific user
 * Re-reads credentials file to support dynamic user creation
 * @param {string} username - Username to get password for
 * @returns {string|null} - Default password or null if user not found (case-sensitive)
 */
const getDefaultPassword = (username) => {
  const credentials = loadCredentials();
  return credentials[username] || null;
};

module.exports = {
  loadCredentials,
  isUsernameAllowed,
  getDefaultPassword
};
