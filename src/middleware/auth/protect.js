const AppError = require('../../utils/AppError');
const { verifyToken } = require('../../utils/jwt');
const authService = require('../../services/auth/authService');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization token is missing', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);

    if (!payload || !payload.sub) {
      return next(new AppError('Invalid token payload', 401));
    }

    const user = await authService.getAuthUser(payload.sub);
    req.user = { id: user.id, email: user.email, name: user.name };

    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

module.exports = protect;
