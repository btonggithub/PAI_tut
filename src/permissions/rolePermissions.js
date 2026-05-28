/**
 * Role-to-Permission Mapping
 *
 * Server-controlled mapping of roles to permissions.
 * Defines which permissions each role grants.
 *
 * Rules:
 * - Never trust client-provided permissions
 * - Never store permissions in JWT during this phase
 * - Unknown roles resolve to empty permission set
 * - This mapping is the source of truth for role permissions
 */

const USER_PERMISSIONS = require('./userPermissions');

const ROLE_PERMISSIONS = {
  admin: [
    USER_PERMISSIONS.READ,
    USER_PERMISSIONS.READ_SELF,
    USER_PERMISSIONS.UPDATE,
    USER_PERMISSIONS.UPDATE_SELF,
    USER_PERMISSIONS.DELETE,
    USER_PERMISSIONS.MANAGE,
  ],
  user: [
    USER_PERMISSIONS.READ_SELF,
    USER_PERMISSIONS.UPDATE_SELF,
  ],
};

/**
 * Get permissions for a role
 *
 * @param {string} role - The role name
 * @returns {string[]} Array of permissions granted to this role
 */
const getPermissionsForRole = (role) => {
  if (!role || typeof role !== 'string') {
    return [];
  }

  return ROLE_PERMISSIONS[role] || [];
};

module.exports = {
  ROLE_PERMISSIONS,
  getPermissionsForRole,
};
