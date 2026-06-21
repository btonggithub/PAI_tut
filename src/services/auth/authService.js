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
const { recordAuditEvent } = require('../audit/auditLogService');
const AUDIT_ACTIONS = require('../audit/auditActions');
const AUDIT_RESULTS = require('../audit/auditResults');
const { domainEventPublisher } = require('../event');

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

const register = async ({ name, email, password }, requestContext = {}) => {
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

  await domainEventPublisher.publishUserRegistered({
    user,
    requestContext,
  });

  return {
    user: toSafeUser(user),
    ...tokens,
  };
};

const login = async ({ email, password }, requestContext = {}) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    // Record failed login audit event
    await recordAuditEvent({
      action: AUDIT_ACTIONS.AUTH_LOGIN,
      result: AUDIT_RESULTS.FAILED,
      resourceType: 'user',
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: 'user_not_found' },
    });

    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    // Record failed login audit event
    await recordAuditEvent({
      action: AUDIT_ACTIONS.AUTH_LOGIN,
      result: AUDIT_RESULTS.FAILED,
      resourceType: 'user',
      resourceId: user._id.toString(),
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: 'invalid_password' },
    });

    throw new AppError('Invalid email or password', 401);
  }

  const tokens = await issueSessionTokens(user.id);

  // Record successful login audit event
  await recordAuditEvent({
    action: AUDIT_ACTIONS.AUTH_LOGIN,
    result: AUDIT_RESULTS.SUCCEEDED,
    actorId: user._id.toString(),
    actorRole: user.role,
    resourceType: 'user',
    resourceId: user._id.toString(),
    ipAddress: requestContext.ipAddress || null,
    userAgent: requestContext.userAgent || null,
    metadata: { email: email.toLowerCase() },
  });

  return {
    user: toSafeUser(user),
    ...tokens,
  };
};

const refresh = async ({ refreshToken }, requestContext = {}) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    await recordAuditEvent({
      action: AUDIT_ACTIONS.AUTH_REFRESH,
      result: AUDIT_RESULTS.FAILED,
      resourceType: 'session',
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: 'invalid_or_expired_token' },
    });

    throw new AppError('Invalid or expired refresh token', 401);
  }

  if (!payload || !payload.sub || !payload.sid) {
    await recordAuditEvent({
      action: AUDIT_ACTIONS.AUTH_REFRESH,
      result: AUDIT_RESULTS.FAILED,
      resourceType: 'session',
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: 'invalid_payload' },
    });

    throw new AppError('Invalid refresh token payload', 401);
  }

  if (payload.type !== 'refresh') {
    await recordAuditEvent({
      action: AUDIT_ACTIONS.AUTH_REFRESH,
      result: AUDIT_RESULTS.FAILED,
      actorId: payload.sub,
      resourceType: 'session',
      resourceId: payload.sid,
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: 'invalid_token_type' },
    });

    throw new AppError('Invalid token type', 401);
  }

  try {
    await sessionService.validateRefreshSession({
      sessionId: payload.sid,
      userId: payload.sub,
      refreshToken,
    });
  } catch (error) {
    await recordAuditEvent({
      action: AUDIT_ACTIONS.AUTH_REFRESH,
      result: AUDIT_RESULTS.FAILED,
      actorId: payload.sub,
      resourceType: 'session',
      resourceId: payload.sid,
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: 'invalid_session' },
    });

    throw error;
  }

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

  // Record successful refresh audit event
  const user = await authRepository.findUserById(payload.sub);
  if (user) {
    await recordAuditEvent({
      action: AUDIT_ACTIONS.AUTH_REFRESH,
      result: AUDIT_RESULTS.SUCCEEDED,
      actorId: payload.sub,
      actorRole: user.role,
      resourceType: 'session',
      resourceId: payload.sid,
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
    });
  }

  const token = signAccessToken({ sub: payload.sub });

  return {
    token,
    refreshToken: nextRefreshToken,
  };
};

const logout = async ({ refreshToken }, requestContext = {}) => {
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

  // Record successful logout audit event
  const user = await authRepository.findUserById(payload.sub);
  if (user) {
    await recordAuditEvent({
      action: AUDIT_ACTIONS.AUTH_LOGOUT,
      result: AUDIT_RESULTS.SUCCEEDED,
      actorId: payload.sub,
      actorRole: user.role,
      resourceType: 'session',
      resourceId: payload.sid,
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
    });
  }

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
