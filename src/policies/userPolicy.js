/**
 * User Authorization Policies
 *
 * Pure functions for user resource authorization.
 * No HTTP logic, no database access, no response formatting.
 *
 * Policy functions use can<Action><Resource>() naming pattern.
 * Returns boolean: true if action is allowed, false otherwise.
 */

const isAdmin = (actor) =>
  actor?.role === 'admin';

const isOwner = (actor, userId) =>
  actor?.id === userId;

/**
 * Check if actor can view target user
 * Admin can view any user
 * User can view own profile
 */
const canViewUser = (actor, userId) =>
  isAdmin(actor) || isOwner(actor, userId);

/**
 * Check if actor can update target user
 * Admin can update any user
 * User can update own profile
 */
const canUpdateUser = (actor, userId) =>
  isAdmin(actor) || isOwner(actor, userId);

/**
 * Check if actor can delete target user
 * Only admin can delete users
 */
const canDeleteUser = (actor) => {
  if (!actor) {
    return false;
  }

  // Only admin can delete users
  return actor.role === 'admin';
};

/**
 * Check if actor can manage users (list, view all)
 * Only admin can manage users
 */
const canManageUsers = (actor) => {
  if (!actor) {
    return false;
  }

  // Only admin can manage users
  return actor.role === 'admin';
};

module.exports = {
  canViewUser,
  canUpdateUser,
  canDeleteUser,
  canManageUsers,
};
