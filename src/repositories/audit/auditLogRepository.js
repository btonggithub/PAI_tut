/**
 * Audit Log Repository
 *
 * Owns all audit log database access.
 * Responsible for persistence of audit events.
 */

const AuditLog = require('../../models/auditLogModel');

/**
 * Create and persist an audit log entry
 *
 * @param {object} payload - The audit log payload
 * @returns {Promise<object>} The created audit log document
 */
const recordAuditLog = async (payload) => {
  return AuditLog.create(payload);
};

module.exports = {
  recordAuditLog,
};
