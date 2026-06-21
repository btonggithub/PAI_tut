const AppError = require('../../utils/AppError');
const { canManageUsers } = require('../../policies/userPolicy');
const auditLogService = require('../audit/auditLogService');

const ensureAdminAccess = (actor) => {
  if (!canManageUsers(actor)) {
    throw new AppError('Forbidden', 403);
  }
};

const listAdminAuditLogs = async ({ query = {}, actor }) => {
  ensureAdminAccess(actor);
  return auditLogService.listAuditLogs(query);
};

module.exports = {
  listAdminAuditLogs,
};
