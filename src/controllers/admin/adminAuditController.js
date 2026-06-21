const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const adminAuditService = require('../../services/admin/adminAuditService');

const listAuditLogs = asyncHandler(async (req, res) => {
  const data = await adminAuditService.listAdminAuditLogs({
    query: req.query,
    actor: req.user,
  });

  return sendSuccess(res, data);
});

module.exports = {
  listAuditLogs,
};
