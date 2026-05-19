const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const rawStatus = err.statusCode || err.status || 500;
  const statusCode = Number.isInteger(rawStatus) ? rawStatus : 500;
  const isOperational = Boolean(err.isOperational);
  const canExposeMessage = isOperational || statusCode < 500;
  const message = canExposeMessage
    ? err.message || 'Request failed'
    : 'Internal Server Error';

  const responseBody = {
    success: false,
    message,
    error: {
      status: statusCode,
    },
  };

  if (env.isDevelopment && !canExposeMessage && err.stack) {
    responseBody.error.stack = err.stack;
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = errorHandler;
