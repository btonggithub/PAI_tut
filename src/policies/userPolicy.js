/**
 * User Authorization Policies
 *
 * Pure functions for user resource authorization.
 * No HTTP logic, no database access, no response formatting.
 *
 * Policy functions use can<Action><Resource>() naming pattern.
 * Returns boolean: true if action is allowed, false otherwise.
 */

const { USER_PERMISSIONS, hasPermission } = require('../permissions');

const isOwner = (actor, userId) =>
  actor?.id === userId;

/**
 * Check if actor can view target user
 * Admin can view any user
 * User can view own profile
 */
const canViewUser = (actor, userId) =>
  hasPermission(actor, USER_PERMISSIONS.READ) ||
  (hasPermission(actor, USER_PERMISSIONS.READ_SELF) && isOwner(actor, userId));

/**
 * Check if actor can update target user
 * Admin can update any user
 * User can update own profile
 */
const canUpdateUser = (actor, userId) =>
  hasPermission(actor, USER_PERMISSIONS.UPDATE) ||
  (hasPermission(actor, USER_PERMISSIONS.UPDATE_SELF) && isOwner(actor, userId));

/**
 * Check if actor can delete target user
 * Only admin can delete users
 */
const canDeleteUser = (actor) => {
  if (!actor) {
    return false;
  }

  return hasPermission(actor, USER_PERMISSIONS.DELETE);
};

/**
 * Check if actor can manage users (list, view all)
 * Only admin can manage users
 */
const canManageUsers = (actor) => {
  if (!actor) {
    return false;
  }

  return hasPermission(actor, USER_PERMISSIONS.MANAGE);
};

module.exports = {
  canViewUser,
  canUpdateUser,
  canDeleteUser,
  canManageUsers,
};
