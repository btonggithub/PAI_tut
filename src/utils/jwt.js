const jwt = require('jsonwebtoken');
const env = require('../config/env');

const DEFAULT_EXPIRES_IN = '1d';

const signToken = (payload, options = {}) => {
  const { expiresIn = DEFAULT_EXPIRES_IN } = options;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken,
};
