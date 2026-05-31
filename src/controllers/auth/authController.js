const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const authService = require('../../services/auth/authService');
const { extractRequestContext } = require('../../utils/requestContext');

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  return sendSuccess(res, data, 201, 'User registered successfully');
});

const login = asyncHandler(async (req, res) => {
  const requestContext = extractRequestContext(req);
  const data = await authService.login(req.body, requestContext);
  return sendSuccess(res, data, 200, 'Login successful');
});

const refresh = asyncHandler(async (req, res) => {
  const requestContext = extractRequestContext(req);
  const data = await authService.refresh(req.body, requestContext);
  return sendSuccess(res, data, 200, 'Token refreshed successfully');
});

const logout = asyncHandler(async (req, res) => {
  const requestContext = extractRequestContext(req);
  const data = await authService.logout(req.body, requestContext);
  return sendSuccess(res, data, 200, 'Logout successful');
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getAuthUser(req.user.id);
  return sendSuccess(res, { user });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};
