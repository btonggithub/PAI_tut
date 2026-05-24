const jwt = require('jsonwebtoken');
const env = require('../config/env');

const DEFAULT_EXPIRES_IN = '1d';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

const signToken = (payload, options = {}) => {
  const { expiresIn = DEFAULT_EXPIRES_IN } = options;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

const signAccessToken = (payload, options = {}) => {
  const { expiresIn = ACCESS_TOKEN_EXPIRES_IN } = options;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

const signRefreshToken = (payload, options = {}) => {
  const { expiresIn = REFRESH_TOKEN_EXPIRES_IN } = options;
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

module.exports = {
  signToken,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
