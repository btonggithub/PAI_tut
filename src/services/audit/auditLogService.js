/**
 * Audit Log Service
 *
 * Provides normalized and sanitized audit event recording.
 * Responsible for:
 * - Normalizing audit payloads
 * - Sanitizing metadata to remove sensitive fields
 * - Calling audit repository for persistence
 * - Keeping audit logic reusable across domain services
 *
 * Rules:
 * - No Express request objects inside this service
 * - No direct token/password/secret storage
 * - No database query orchestration (that's repository responsibility)
 * - Pure data normalization
 */

const auditLogRepository = require('../../repositories/audit/auditLogRepository');
const AUDIT_RESULTS = require('./auditResults');

/**
 * Sanitize metadata to remove sensitive fields
 *
 * Removes:
 * - Authorization headers
 * - Tokens or token-like values
 * - Passwords
 * - Sensitive authentication fields
 *
 * @param {object} metadata - Raw metadata object
 * @returns {object} Sanitized metadata
 */
const sanitizeMetadata = (metadata = {}) => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const sanitized = { ...metadata };
  const sensitiveKeys = ['password', 'token', 'refreshToken', 'accessToken', 'authorization', 'bearer'];

  // Remove sensitive keys (case-insensitive)
  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitiveKey) => lowerKey.includes(sensitiveKey))) {
      delete sanitized[key];
    }
  });

  return sanitized;
};

/**
 * Record an audit event
 *
 * Normalizes the audit payload, sanitizes metadata, and persists the event.
 *
 * @param {object} payload - The audit event payload
 *   - action: required audit action name
 *   - result: required audit result
 *   - actorId: optional actor user ID
 *   - actorRole: optional actor role
 *   - resourceType: optional resource being audited
 *   - resourceId: optional ID of resource
 *   - ipAddress: optional source IP
 *   - userAgent: optional user agent string
 *   - metadata: optional additional context
 *
 * @returns {Promise<object|null>} The created audit log, or null when audit persistence fails
 */
const recordAuditEvent = async (payload = {}) => {
  const normalized = {
    action: payload.action,
    result: payload.result || AUDIT_RESULTS.SUCCEEDED,
    actorId: payload.actorId || null,
    actorRole: payload.actorRole || null,
    resourceType: payload.resourceType || null,
    resourceId: payload.resourceId || null,
    ipAddress: payload.ipAddress || null,
    userAgent: payload.userAgent || null,
    metadata: sanitizeMetadata(payload.metadata),
  };

  try {
    return await auditLogRepository.recordAuditLog(normalized);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[audit] Failed to record audit event:', error.message);
    }

    return null;
  }
};

const toSafeAuditLog = (auditLog) => ({
  id: auditLog._id ? String(auditLog._id) : String(auditLog.id),
  actorId: auditLog.actorId ? String(auditLog.actorId) : null,
  actorRole: auditLog.actorRole || null,
  action: auditLog.action,
  resourceType: auditLog.resourceType || null,
  resourceId: auditLog.resourceId || null,
  result: auditLog.result,
  ipAddress: auditLog.ipAddress || null,
  userAgent: auditLog.userAgent || null,
  metadata: sanitizeMetadata(auditLog.metadata),
  createdAt: auditLog.createdAt,
  updatedAt: auditLog.updatedAt,
});

const listAuditLogs = async (query = {}) => {
  const result = await auditLogRepository.findAuditLogs(query);

  return {
    auditLogs: result.items.map(toSafeAuditLog),
    meta: result.meta,
  };
};

module.exports = {
  recordAuditEvent,
  sanitizeMetadata,
  listAuditLogs,
};
