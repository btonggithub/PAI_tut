/**
 * User Permission Constants
 *
 * Centralized permission definitions for user resource operations.
 * Permission strings follow resource.action or resource.action.scope convention.
 *
 * Usage:
 *   - Pass to requirePermission middleware
 *   - Use in permission evaluation helpers
 *   - Reference in policies
 */

const USER_PERMISSIONS = {
  // Read operations
  READ: 'user.read',
  READ_SELF: 'user.read.self',

  // Update operations
  UPDATE: 'user.update',
  UPDATE_SELF: 'user.update.self',

  // Delete operations
  DELETE: 'user.delete',

  // Management operations
  MANAGE: 'user.manage',
};

module.exports = USER_PERMISSIONS;
