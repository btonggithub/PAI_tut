const crypto = require('crypto');

/**
 * Generate a cryptographically secure random token
 * @returns {string} Raw token (hex string)
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token using SHA256 deterministic hashing
 * @param {string} token - Raw token
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Compare raw token against hashed token using SHA256
 * @param {string} rawToken - Raw token to verify
 * @param {string} hashedToken - Previously hashed token from storage
 * @returns {boolean} True if tokens match
 */
const compareToken = (rawToken, hashedToken) => {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return hash === hashedToken;
};

module.exports = {
  generateToken,
  hashToken,
  compareToken,
};
