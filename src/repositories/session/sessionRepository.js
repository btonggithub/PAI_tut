const Session = require('../../models/sessionModel');

const createSession = async ({ userId, refreshTokenHash, expiresAt }) => {
  return Session.create({
    userId,
    refreshTokenHash,
    expiresAt,
  });
};

const findActiveSessionByIdAndUser = async (sessionId, userId) => {
  return Session.findOne({
    _id: sessionId,
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).lean();
};

const rotateSessionRefreshToken = async (sessionId, userId, refreshTokenHash, expiresAt) => {
  return Session.findOneAndUpdate(
    {
      _id: sessionId,
      userId,
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
      _id: sessionId,
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
