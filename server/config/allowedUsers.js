/**
 * Allowed Usernames Configuration
 * Only users in this list can register/login
 * Credentials are loaded from environment variable USER_CREDENTIALS
 */

/**
 * Parse user credentials from environment variable
 * Expected format: JSON string like {"admin":"pass1","user1":"pass2"}
 */
const parseCredentials = () => {
  const credentialsJson = process.env.USER_CREDENTIALS;
  
  if (!credentialsJson) {
    console.error('WARNING: USER_CREDENTIALS environment variable is not set!');
    return {};
  }
  
  try {
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error('ERROR: Failed to parse USER_CREDENTIALS JSON:', error.message);
    return {};
  }
};

const USER_CREDENTIALS = parseCredentials();
console.log("USER_CREDENTIALS" + USER_CREDENTIALS)

// Extract allowed usernames from credentials
const ALLOWED_USERNAMES = Object.keys(USER_CREDENTIALS);
console.log("ALLOWED_USERNAMES: " + ALLOWED_USERNAMES)

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
