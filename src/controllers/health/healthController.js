const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const healthService = require('../../services/health/healthService');

const getHealth = asyncHandler(async (req, res) => {
  const data = await healthService.getHealthStatus();
  return sendSuccess(res, data);
});

module.exports = {
  getHealth,
};
