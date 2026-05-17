const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const systemService = require('../../services/system/systemService');

const getSystemInfo = asyncHandler(async (req, res) => {
  const { scope } = req.query;
  const data = await systemService.getSystemInfo(scope);
  return sendSuccess(res, data);
});

module.exports = {
  getSystemInfo,
};
