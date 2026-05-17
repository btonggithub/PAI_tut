const asyncHandler = require('../../utils/asyncHandler');

const getHealth = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
    },
  });
});

module.exports = {
  getHealth,
};
