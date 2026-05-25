const crypto = require('crypto');
const AppError = require('../../utils/AppError');
const sessionRepository = require('../../repositories/session/sessionRepository');

const hashRefreshToken = (refreshToken) => {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
};

const secureHashEquals = (left, right) => {
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const createSession = async ({ userId, sessionId, refreshTokenHash, expiresAt }) => {
  if (!sessionId) {
    throw new AppError('sessionID is required', 500);
  }

  return sessionRepository.createSession({
    userId,
    sessionId,
    refreshTokenHash,
    expiresAt,
  });
};

const validateRefreshSession = async ({ sessionId, userId, refreshToken }) => {
  const session = await sessionRepository.findActiveSessionByIdAndUser(sessionId, userId);

  if (!session) {
    throw new AppError('Invalid refresh token', 401);
  }

  const providedHash = hashRefreshToken(refreshToken);
  const isHashValid = secureHashEquals(providedHash, session.refreshTokenHash);

  if (!isHashValid) {
    throw new AppError('Invalid refresh token', 401);
  }

  return session;
};

const rotateSessionRefreshToken = async ({ sessionId, userId, currentRefreshToken, refreshToken, expiresAt }) => {
  const currentHash = hashRefreshToken(currentRefreshToken);
  const nextHash = hashRefreshToken(refreshToken);

  const rotatedSession = await sessionRepository.rotateSessionRefreshToken(
    sessionId,
    userId,
    currentHash,
    nextHash,
    expiresAt
  );

  if (!rotatedSession) {
    throw new AppError('Invalid refresh token', 401);
  }

  return rotatedSession;
};

const revokeSession = async ({ sessionId, userId }) => {
  const revokedSession = await sessionRepository.revokeSessionByIdAndUser(sessionId, userId);

  if (!revokedSession) {
    throw new AppError('Invalid refresh token', 401);
  }

  return revokedSession;
};

module.exports = {
  hashRefreshToken,
  createSession,
  validateRefreshSession,
  rotateSessionRefreshToken,
  revokeSession,
};
