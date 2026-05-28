/**
 * Permissions Module
 *
 * Centralized permission system exports
 */

const USER_PERMISSIONS = require('./userPermissions');
const { ROLE_PERMISSIONS, getPermissionsForRole } = require('./rolePermissions');
const hasPermission = require('./hasPermission');

module.exports = {
  USER_PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  hasPermission,
};
