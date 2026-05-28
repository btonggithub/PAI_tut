/**
 * Permission Evaluation Helper
 *
 * Pure function for checking if an actor has a specific permission.
 *
 * Rules:
 * - Pure function only (no side effects)
 * - No database access
 * - No HTTP logic
 * - No response formatting
 * - Returns boolean only
 * - Do not throw AppError inside this helper
 */

const { getPermissionsForRole } = require('./rolePermissions');

/**
 * Check if actor has the specified permission
 *
 * @param {object} actor - The actor object with id and role
 * @param {string} permission - The permission string to check
 * @returns {boolean} True if actor has the permission, false otherwise
 */
const hasPermission = (actor, permission) => {
  if (!actor || !actor.role || !permission) {
    return false;
  }

  const permissions = getPermissionsForRole(actor.role);
  return permissions.includes(permission);
};

module.exports = hasPermission;
