const AppError = require('../../utils/AppError');

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    throw new AppError('Authorization token is missing', 401);
  }

  if (typeof authorizationHeader !== 'string') {
    throw new AppError('Authorization header is malformed', 401);
  }

  const parts = authorizationHeader.trim().split(/\s+/);

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AppError('Authorization header must use Bearer token format', 401);
  }

  const token = parts[1];

  if (!token) {
    throw new AppError('Authorization token is missing', 401);
  }

  return token;
};

module.exports = extractBearerToken;
