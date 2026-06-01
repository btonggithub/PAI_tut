const { VerificationToken, VERIFICATION_TOKEN_TYPES } = require('../../models/verificationTokenModel');
const BaseRepository = require('../base/BaseRepository');

const verificationBaseRepository = new BaseRepository(VerificationToken);

const createVerificationToken = async (payload) => {
  return VerificationToken.create(payload);
};

const findValidVerificationToken = async (userId, tokenHash, type = VERIFICATION_TOKEN_TYPES.EMAIL) => {
  const now = new Date();
  return VerificationToken.findOne({
    userId,
    tokenHash,
    type,
    usedAt: null,
    expiresAt: { $gt: now },
  }).lean();
};

const findVerificationTokenByHash = async (tokenHash, type = VERIFICATION_TOKEN_TYPES.EMAIL) => {
  const now = new Date();
  return VerificationToken.findOne({
    tokenHash,
    type,
    usedAt: null,
    expiresAt: { $gt: now },
  }).lean();
};

const markTokenUsed = async (tokenId) => {
  return VerificationToken.findByIdAndUpdate(
    tokenId,
    { usedAt: new Date() },
    { new: true, runValidators: true }
  ).lean();
};

const deleteExpiredTokens = async (expirationDate = new Date()) => {
  const result = await VerificationToken.deleteMany({
    expiresAt: { $lt: expirationDate },
  });
  return result.deletedCount;
};

const invalidatePreviousTokens = async (userId, type = VERIFICATION_TOKEN_TYPES.EMAIL) => {
  const result = await VerificationToken.updateMany(
    {
      userId,
      type,
      usedAt: null,
    },
    {
      usedAt: new Date(),
    }
  );
  return result.modifiedCount;
};

const findTokenById = async (tokenId) => {
  return VerificationToken.findById(tokenId).lean();
};

module.exports = {
  createVerificationToken,
  findValidVerificationToken,
  findVerificationTokenByHash,
  markTokenUsed,
  deleteExpiredTokens,
  invalidatePreviousTokens,
  findTokenById,
};
