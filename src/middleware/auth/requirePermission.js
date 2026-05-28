/**
 * Permission Middleware
 *
 * Checks if authenticated user has the required permission.
 *
 * Responsibilities:
 * - Require authenticated user
 * - Evaluate hasPermission(req.user, permission)
 * - Call next() when allowed
 * - Return 401 if no authenticated user exists
 * - Return 403 if actor lacks permission
 *
 * Rules:
 * - Must remain reusable
 * - Must not query the database
 * - Must not contain resource ownership logic (use policies for that)
 * - Must not contain route-specific business rules
 * - Must use centralized permission constants
 */

const AppError = require('../../utils/AppError');
const hasPermission = require('../../permissions/hasPermission');

/**
 * Middleware factory for permission checking
 *
 * @param {string} permission - The required permission string
 * @returns {function} Express middleware function
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!hasPermission(req.user, permission)) {
      return next(new AppError('Forbidden', 403));
    }

    return next();
  };
};

module.exports = requirePermission;
