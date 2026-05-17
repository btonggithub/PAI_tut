const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');

const getHealth = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    status: 'ok',
  });
});

module.exports = {
  getHealth,
};
