const crypto = require('crypto');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Generate a cryptographically secure random token
 * @returns {string} Raw token (hex string)
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token for secure storage
 * @param {string} token - Raw token
 * @returns {Promise<string>} Hashed token
 */
const hashToken = async (token) => {
  return bcrypt.hash(token, SALT_ROUNDS);
};

/**
 * Compare raw token against hashed token
 * @param {string} rawToken - Raw token to verify
 * @param {string} hashedToken - Previously hashed token from storage
 * @returns {Promise<boolean>} True if tokens match
 */
const compareToken = async (rawToken, hashedToken) => {
  return bcrypt.compare(rawToken, hashedToken);
};

module.exports = {
  generateToken,
  hashToken,
  compareToken,
};
