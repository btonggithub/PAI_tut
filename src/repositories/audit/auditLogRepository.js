/**
 * Audit Log Repository
 *
 * Owns all audit log database access.
 * Responsible for persistence of audit events.
 */

const AuditLog = require('../../models/auditLogModel');
const BaseRepository = require('../base/BaseRepository');

const auditLogBaseRepository = new BaseRepository(AuditLog);

/**
 * Create and persist an audit log entry
 *
 * @param {object} payload - The audit log payload
 * @returns {Promise<object>} The created audit log document
 */
const recordAuditLog = async (payload) => {
  return AuditLog.create(payload);
};

const buildAuditLogFilters = (query = {}) => {
  const filters = auditLogBaseRepository.buildFilters(query, [
    'action',
    'result',
    'actorId',
    'actorRole',
    'resourceType',
    'resourceId',
  ]);

  if (query.from || query.to) {
    filters.createdAt = {};

    if (query.from) {
      filters.createdAt.$gte = new Date(query.from);
    }

    if (query.to) {
      filters.createdAt.$lte = new Date(query.to);
    }
  }

  return filters;
};

const findAuditLogs = async (query = {}) => {
  const filters = buildAuditLogFilters(query);
  const sort = auditLogBaseRepository.buildSort(
    query.sort,
    ['createdAt', 'action', 'result', 'actorRole', 'resourceType'],
    '-createdAt'
  );
  const pagination = auditLogBaseRepository.buildPagination(query);

  const [items, total] = await Promise.all([
    AuditLog.find(filters)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    AuditLog.countDocuments(filters),
  ]);

  return {
    items,
    meta: auditLogBaseRepository.buildMeta(total, pagination),
  };
};

module.exports = {
  recordAuditLog,
  findAuditLogs,
};
