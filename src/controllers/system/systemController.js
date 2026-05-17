const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/response');

const getSystemInfo = asyncHandler(async (req, res) => {
  const scope = req.query.scope;

  if (scope && scope !== 'basic') {
    throw new AppError('Invalid scope parameter. Allowed value: basic', 400);
  }

  return sendSuccess(res, {
    service: 'PAI_tut Backend',
    version: 'v1',
    uptime: process.uptime(),
  });
});

module.exports = {
  getSystemInfo,
};
