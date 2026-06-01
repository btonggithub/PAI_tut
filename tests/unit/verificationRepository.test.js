jest.mock('../../src/models/verificationTokenModel');

const verificationRepository = require('../../src/repositories/email/verificationRepository');
const { VerificationToken, VERIFICATION_TOKEN_TYPES } = require('../../src/models/verificationTokenModel');

describe('Verification repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVerificationToken', () => {
    it('creates a verification token', async () => {
      const payload = {
        userId: 'user123',
        tokenHash: 'hashedtoken',
        type: VERIFICATION_TOKEN_TYPES.EMAIL,
        expiresAt: new Date(Date.now() + 86400000),
        metadata: { email: 'user@example.com' },
      };
      const mockToken = { _id: 'token123', ...payload };
      VerificationToken.create.mockResolvedValue(mockToken);

      const result = await verificationRepository.createVerificationToken(payload);

      expect(VerificationToken.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockToken);
    });
  });

  describe('findValidVerificationToken', () => {
    it('finds a valid verification token by userId and hash', async () => {
      const userId = 'user123';
      const tokenHash = 'hashedtoken';
      const mockToken = {
        _id: 'token123',
        userId,
        tokenHash,
        type: VERIFICATION_TOKEN_TYPES.EMAIL,
        usedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
      };
      VerificationToken.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockToken) });

      const result = await verificationRepository.findValidVerificationToken(
        userId,
        tokenHash,
        VERIFICATION_TOKEN_TYPES.EMAIL
      );

      expect(VerificationToken.findOne).toHaveBeenCalledWith({
        userId,
        tokenHash,
        type: VERIFICATION_TOKEN_TYPES.EMAIL,
        usedAt: null,
        expiresAt: { $gt: expect.any(Date) },
      });
      expect(result).toEqual(mockToken);
    });

    it('returns null for expired token', async () => {
      const userId = 'user123';
      const tokenHash = 'hashedtoken';
      VerificationToken.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const result = await verificationRepository.findValidVerificationToken(
        userId,
        tokenHash,
        VERIFICATION_TOKEN_TYPES.EMAIL
      );

      expect(result).toBeNull();
    });

    it('returns null for used token', async () => {
      const userId = 'user123';
      const tokenHash = 'hashedtoken';
      VerificationToken.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const result = await verificationRepository.findValidVerificationToken(
        userId,
        tokenHash,
        VERIFICATION_TOKEN_TYPES.EMAIL
      );

      expect(result).toBeNull();
    });
  });

  describe('findVerificationTokenByHash', () => {
    it('finds a valid verification token by hash only (no userId required)', async () => {
      const tokenHash = 'hashedtoken';
      const userId = 'user123';
      const mockToken = {
        _id: 'token123',
        userId,
        tokenHash,
        type: VERIFICATION_TOKEN_TYPES.EMAIL,
        usedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
      };
      VerificationToken.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockToken) });

      const result = await verificationRepository.findVerificationTokenByHash(
        tokenHash,
        VERIFICATION_TOKEN_TYPES.EMAIL
      );

      expect(VerificationToken.findOne).toHaveBeenCalledWith({
        tokenHash,
        type: VERIFICATION_TOKEN_TYPES.EMAIL,
        usedAt: null,
        expiresAt: { $gt: expect.any(Date) },
      });
      expect(result).toEqual(mockToken);
    });

    it('returns null for invalid token hash', async () => {
      const tokenHash = 'invalidhash';
      VerificationToken.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const result = await verificationRepository.findVerificationTokenByHash(
        tokenHash,
        VERIFICATION_TOKEN_TYPES.EMAIL
      );

      expect(result).toBeNull();
    });
  });

  describe('markTokenUsed', () => {
    it('marks a token as used', async () => {
      const tokenId = 'token123';
      const mockUpdatedToken = {
        _id: tokenId,
        usedAt: new Date(),
      };
      VerificationToken.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUpdatedToken),
      });

      const result = await verificationRepository.markTokenUsed(tokenId);

      expect(VerificationToken.findByIdAndUpdate).toHaveBeenCalledWith(
        tokenId,
        { usedAt: expect.any(Date) },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockUpdatedToken);
    });
  });

  describe('deleteExpiredTokens', () => {
    it('deletes expired tokens', async () => {
      const expirationDate = new Date();
      const mockResult = { deletedCount: 5 };
      VerificationToken.deleteMany.mockResolvedValue(mockResult);

      const result = await verificationRepository.deleteExpiredTokens(expirationDate);

      expect(VerificationToken.deleteMany).toHaveBeenCalledWith({
        expiresAt: { $lt: expirationDate },
      });
      expect(result).toBe(5);
    });

    it('uses current date if no expiration date provided', async () => {
      const mockResult = { deletedCount: 3 };
      VerificationToken.deleteMany.mockResolvedValue(mockResult);

      const result = await verificationRepository.deleteExpiredTokens();

      expect(VerificationToken.deleteMany).toHaveBeenCalledWith({
        expiresAt: { $lt: expect.any(Date) },
      });
      expect(result).toBe(3);
    });
  });

  describe('invalidatePreviousTokens', () => {
    it('invalidates previous unverified tokens', async () => {
      const userId = 'user123';
      const mockResult = { modifiedCount: 2 };
      VerificationToken.updateMany.mockResolvedValue(mockResult);

      const result = await verificationRepository.invalidatePreviousTokens(
        userId,
        VERIFICATION_TOKEN_TYPES.EMAIL
      );

      expect(VerificationToken.updateMany).toHaveBeenCalledWith(
        {
          userId,
          type: VERIFICATION_TOKEN_TYPES.EMAIL,
          usedAt: null,
        },
        { usedAt: expect.any(Date) }
      );
      expect(result).toBe(2);
    });
  });

  describe('findTokenById', () => {
    it('finds a token by ID', async () => {
      const tokenId = 'token123';
      const mockToken = { _id: tokenId, userId: 'user123' };
      VerificationToken.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockToken) });

      const result = await verificationRepository.findTokenById(tokenId);

      expect(VerificationToken.findById).toHaveBeenCalledWith(tokenId);
      expect(result).toEqual(mockToken);
    });
  });
});
