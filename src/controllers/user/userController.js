const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const userService = require('../../services/user/userService');

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.user.id);
  return sendSuccess(res, { user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user.id, req.body);
  return sendSuccess(res, { user }, 200, 'Profile updated successfully');
});

const listUsers = asyncHandler(async (req, res) => {
  const data = await userService.listUsers(req.query);
  return sendSuccess(res, data);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, { user });
});

module.exports = {
  getMe,
  updateMe,
  listUsers,
  getUserById,
};
