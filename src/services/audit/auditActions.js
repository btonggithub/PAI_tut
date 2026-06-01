/**
 * Audit Action Constants
 *
 * Centralized, stable action names for audit logging.
 * Action names are lowercase and dot-separated.
 *
 * Format: domain.entity.action
 *
 * Examples:
 *   auth.login
 *   auth.logout
 *   user.profile.update
 */

const AUDIT_ACTIONS = {
  // Authentication actions
  AUTH_LOGIN: 'auth.login',
  AUTH_REFRESH: 'auth.refresh',
  AUTH_LOGOUT: 'auth.logout',

  // User actions
  USER_PROFILE_UPDATE: 'user.profile.update',
  USER_READ_ADMIN: 'user.read.admin',

  // File actions
  FILE_UPLOAD: 'file.upload',
  FILE_LIST: 'file.list',
  FILE_VIEW: 'file.view',

  // Email verification actions
  EMAIL_SEND_VERIFICATION: 'email.send_verification',
  EMAIL_VERIFY: 'email.verify',
  EMAIL_RESEND_VERIFICATION: 'email.resend_verification',
};

module.exports = AUDIT_ACTIONS;
