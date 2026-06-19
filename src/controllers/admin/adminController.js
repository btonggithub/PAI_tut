const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const { extractRequestContext } = require('../../utils/requestContext');
const adminService = require('../../services/admin/adminService');

const listUsers = asyncHandler(async (req, res) => {
  const requestContext = extractRequestContext(req);
  const data = await adminService.listAdminUsers({
    query: req.query,
    actor: req.user,
    requestContext,
  });

  return sendSuccess(res, data);
});

const getUserById = asyncHandler(async (req, res) => {
  const requestContext = extractRequestContext(req);
  const user = await adminService.getAdminUserById({
    userId: req.params.id,
    actor: req.user,
    requestContext,
  });

  return sendSuccess(res, { user });
});

const listFiles = asyncHandler(async (req, res) => {
  const data = await adminService.listAdminFiles({
    query: req.query,
    actor: req.user,
  });

  return sendSuccess(res, data);
});

const getFileById = asyncHandler(async (req, res) => {
  const file = await adminService.getAdminFileById({
    fileId: req.params.id,
    actor: req.user,
  });

  return sendSuccess(res, { file });
});

const getSystemInfo = asyncHandler(async (req, res) => {
  const data = await adminService.getAdminSystemInfo({ actor: req.user });
  return sendSuccess(res, data);
});

module.exports = {
  listUsers,
  getUserById,
  listFiles,
  getFileById,
  getSystemInfo,
};