const AppError = require('../../utils/AppError');
const { verifyToken } = require('../../utils/jwt');
const authService = require('../../services/auth/authService');
const extractBearerToken = require('./extractBearerToken');

const protect = async (req, res, next) => {
  let token;

  try {
    token = extractBearerToken(req.headers.authorization);
  } catch (error) {
    return next(error);
  }

  try {
    const payload = verifyToken(token);

    if (!payload || !payload.sub) {
      return next(new AppError('Invalid token payload', 401));
    }

    const user = await authService.getAuthUser(payload.sub);
    req.user = { id: user.id, email: user.email, name: user.name };

    return next();
  } catch (error) {
    if (error.isOperational) {
      return next(error);
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired', 401));
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return next(new AppError('Invalid authentication token', 401));
    }

    return next(new AppError('Invalid or expired token', 401));
  }
};

module.exports = protect;
