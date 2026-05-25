const Session = require('../../models/sessionModel');

const createSession = async ({ userId, sessionId, refreshTokenHash, expiresAt }) => {
  return Session.create({
    userId,
    sessionId,
    refreshTokenHash,
    expiresAt,
  });
};

const findActiveSessionByIdAndUser = async (sessionId, userId) => {
  return Session.findOne({
    sessionId,
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).lean();
};

const rotateSessionRefreshToken = async (sessionId, userId, currentHash, refreshTokenHash, expiresAt) => {
  return Session.findOneAndUpdate(
    {
      sessionId,
      userId,
      refreshTokenHash: currentHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        refreshTokenHash,
        expiresAt,
      },
    },
    {
      new: true,
    }
  ).lean();
};

const revokeSessionByIdAndUser = async (sessionId, userId) => {
  return Session.findOneAndUpdate(
    {
      sessionId,
      userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
    {
      new: true,
    }
  ).lean();
};

module.exports = {
  createSession,
  findActiveSessionByIdAndUser,
  rotateSessionRefreshToken,
  revokeSessionByIdAndUser,
};
