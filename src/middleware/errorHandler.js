const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err.isOperational) {
    // AppError instance
    statusCode = err.statusCode || 500;
    message = err.message;
  } else if (err.statusCode) {
    // Other errors with statusCode
    statusCode = err.statusCode;
    message = err.message || 'Internal Server Error';
  } else if (err.status) {
    // Other errors with status
    statusCode = err.status;
    message = err.message || 'Internal Server Error';
  }

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
    },
  });
};

module.exports = errorHandler;
