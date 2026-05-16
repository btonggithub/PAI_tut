const asyncHandler = require('../utils/asyncHandler');

const getHealth = asyncHandler(async (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = {
  getHealth,
};
