const mongoose = require('mongoose');

const VERIFICATION_TOKEN_TYPES = {
  EMAIL: 'email',
};

const verificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(VERIFICATION_TOKEN_TYPES),
      default: VERIFICATION_TOKEN_TYPES.EMAIL,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding valid tokens: not yet used and not expired
verificationTokenSchema.index({
  userId: 1,
  usedAt: 1,
  expiresAt: 1,
});

// TTL index to auto-delete expired documents immediately after expiry
verificationTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const VerificationToken = mongoose.models.VerificationToken || 
  mongoose.model('VerificationToken', verificationTokenSchema);

module.exports = {
  VerificationToken,
  VERIFICATION_TOKEN_TYPES,
};
