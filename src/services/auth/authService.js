const AppError = require('../../utils/AppError');
const crypto = require('crypto');
const { hashPassword, comparePassword } = require('../../utils/password');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../../utils/jwt');
const authRepository = require('../../repositories/auth/authRepository');
const { toSafeUser } = require('../user/userMapper');
const sessionService = require('../session/sessionService');

const toRefreshExpiryDate = (payload) => {
  return new Date(payload.exp * 1000);
};

const issueSessionTokens = async (userId) => {
  const sessionId = crypto.randomUUID();

  const refreshToken = signRefreshToken({
    sub: userId,
    sid: sessionId,
    jti: crypto.randomUUID(),
    type: 'refresh',
  });

  const refreshPayload = verifyRefreshToken(refreshToken);
  const refreshTokenHash = sessionService.hashRefreshToken(refreshToken);

  await sessionService.createSession({
    userId,
    sessionId,
    refreshTokenHash,
    expiresAt: toRefreshExpiryDate(refreshPayload),
  });

  const token = signAccessToken({ sub: userId });

  return {
    token,
    refreshToken,
  };
};

const register = async ({ name, email, password }) => {
  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  const hashedPassword = await hashPassword(password);
  const user = await authRepository.createUser({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const tokens = await issueSessionTokens(user.id);

  return {
    user: toSafeUser(user),
    ...tokens,
  };
};

const login = async ({ email, password }) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokens = await issueSessionTokens(user.id);

  return {
    user: toSafeUser(user),
    ...tokens,
  };
};

const refresh = async ({ refreshToken }) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  if (!payload || !payload.sub || !payload.sid) {
    throw new AppError('Invalid refresh token payload', 401);
  }

  if (payload.type !== 'refresh') {
    throw new AppError('Invalid token type', 401);
  }

  await sessionService.validateRefreshSession({
    sessionId: payload.sid,
    userId: payload.sub,
    refreshToken,
  });

  const nextRefreshToken = signRefreshToken({
    sub: payload.sub,
    sid: payload.sid,
    jti: crypto.randomUUID(),
    type: 'refresh',
  });
  const nextRefreshPayload = verifyRefreshToken(nextRefreshToken);

  await sessionService.rotateSessionRefreshToken({
    sessionId: payload.sid,
    userId: payload.sub,
    currentRefreshToken: refreshToken,
    refreshToken: nextRefreshToken,
    expiresAt: toRefreshExpiryDate(nextRefreshPayload),
  });

  const token = signAccessToken({ sub: payload.sub });

  return {
    token,
    refreshToken: nextRefreshToken,
  };
};

const logout = async ({ refreshToken }) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  if (!payload || !payload.sub || !payload.sid) {
    throw new AppError('Invalid refresh token payload', 401);
  }

  if (payload.type !== 'refresh') {
    throw new AppError('Invalid token type', 401);
  }

  await sessionService.validateRefreshSession({
    sessionId: payload.sid,
    userId: payload.sub,
    refreshToken,
  });

  await sessionService.revokeSession({
    sessionId: payload.sid,
    userId: payload.sub,
  });

  return {
    loggedOut: true,
  };
};

const getAuthUser = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return toSafeUser(user);
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getAuthUser,
};
