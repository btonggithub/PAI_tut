const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const verificationService = require('../../services/email/verificationService');
const { extractRequestContext } = require('../../utils/requestContext');
const AppError = require('../../utils/AppError');

const sendVerification = asyncHandler(async (req, res) => {
  const requestContext = extractRequestContext(req);
  const result = await verificationService.sendVerificationEmail(req.user, requestContext);
  return sendSuccess(res, result, 200, 'Verification email sent successfully');
});

const verify = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new AppError('Verification token is required', 400);
  }

  const requestContext = extractRequestContext(req);
  const result = await verificationService.verifyEmail(token, requestContext);
  return sendSuccess(res, result, 200, 'Email verified successfully');
});

const resendVerification = asyncHandler(async (req, res) => {
  const requestContext = extractRequestContext(req);
  const result = await verificationService.resendVerificationEmail(req.user, requestContext);
  return sendSuccess(res, result, 200, 'Verification email resent successfully');
});

module.exports = {
  sendVerification,
  verify,
  resendVerification,
};
