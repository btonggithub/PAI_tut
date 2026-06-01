jest.mock('../../src/repositories/email/verificationRepository');
jest.mock('../../src/repositories/user/userRepository');
jest.mock('../../src/services/email/emailService');
jest.mock('../../src/utils/token');
jest.mock('../../src/services/audit/auditLogService');

const verificationService = require('../../src/services/email/verificationService');
const verificationRepository = require('../../src/repositories/email/verificationRepository');
const userRepository = require('../../src/repositories/user/userRepository');
const emailService = require('../../src/services/email/emailService');
const { generateToken, hashToken } = require('../../src/utils/token');
const { recordAuditEvent } = require('../../src/services/audit/auditLogService');
const AppError = require('../../src/utils/AppError');
const { VERIFICATION_TOKEN_TYPES } = require('../../src/models/verificationTokenModel');

describe('Verification service', () => {
  const mockUser = {
    id: 'user123',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user',
  };

  const mockRequestContext = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    generateToken.mockReturnValue('raw-token-string');
    hashToken.mockResolvedValue('hashed-token-string');
  });

  describe('sendVerificationEmail', () => {
    it('sends verification email successfully', async () => {
      const mockTokenRecord = {
        _id: 'token123',
        userId: mockUser.id,
        tokenHash: 'hashed-token-string',
        expiresAt: new Date(Date.now() + 86400000),
      };

      verificationRepository.invalidatePreviousTokens.mockResolvedValue(0);
      verificationRepository.createVerificationToken.mockResolvedValue(mockTokenRecord);
      emailService.sendEmail.mockResolvedValue({});
      recordAuditEvent.mockResolvedValue({});

      const result = await verificationService.sendVerificationEmail(mockUser, mockRequestContext);

      expect(verificationRepository.invalidatePreviousTokens).toHaveBeenCalledWith(
        mockUser.id,
        VERIFICATION_TOKEN_TYPES.EMAIL
      );
      expect(generateToken).toHaveBeenCalled();
      expect(hashToken).toHaveBeenCalledWith('raw-token-string');
      expect(verificationRepository.createVerificationToken).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'Verify Your Email Address',
        html: expect.stringContaining('Email Verification'),
        body: expect.stringContaining('Email Verification'),
      });
      expect(result).toHaveProperty('tokenId');
      expect(result).toHaveProperty('expiresAt');
      expect(result).toHaveProperty('sentAt');
    });

    it('throws error if user is invalid', async () => {
      await expect(verificationService.sendVerificationEmail(null, mockRequestContext)).rejects.toThrow(
        AppError
      );
    });

    it('throws error if user has no email', async () => {
      await expect(
        verificationService.sendVerificationEmail({ ...mockUser, email: null }, mockRequestContext)
      ).rejects.toThrow(AppError);
    });

    it('records audit event on failure', async () => {
      const error = new Error('Send failed');
      verificationRepository.invalidatePreviousTokens.mockRejectedValue(error);

      await expect(verificationService.sendVerificationEmail(mockUser, mockRequestContext)).rejects.toThrow();

      expect(recordAuditEvent).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('verifies email successfully', async () => {
      const mockTokenRecord = {
        _id: 'token123',
        tokenHash: 'hashed-token-string',
        usedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
        metadata: { email: mockUser.email },
      };

      const mockUpdatedUser = {
        _id: mockUser.id,
        email: mockUser.email,
        emailVerified: true,
        emailVerifiedAt: expect.any(Date),
      };

      verificationRepository.findValidVerificationToken.mockResolvedValue(mockTokenRecord);
      verificationRepository.markTokenUsed.mockResolvedValue({});
      userRepository.updateUserProfile.mockResolvedValue(mockUpdatedUser);
      recordAuditEvent.mockResolvedValue({});

      const result = await verificationService.verifyEmail(mockUser.id, 'raw-token', mockRequestContext);

      expect(hashToken).toHaveBeenCalledWith('raw-token');
      expect(verificationRepository.findValidVerificationToken).toHaveBeenCalledWith(
        mockUser.id,
        'hashed-token-string',
        VERIFICATION_TOKEN_TYPES.EMAIL
      );
      expect(verificationRepository.markTokenUsed).toHaveBeenCalledWith(mockTokenRecord._id);
      expect(userRepository.updateUserProfile).toHaveBeenCalledWith(mockUser.id, {
        emailVerified: true,
        emailVerifiedAt: expect.any(Date),
      });
      expect(result).toHaveProperty('userId', mockUser.id);
      expect(result).toHaveProperty('verifiedAt');
      expect(result).toHaveProperty('email', mockUser.email);
    });

    it('throws error if token is invalid', async () => {
      verificationRepository.findValidVerificationToken.mockResolvedValue(null);

      await expect(verificationService.verifyEmail(mockUser.id, 'invalid-token', mockRequestContext)).rejects.toThrow(
        /invalid or expired/i
      );
    });

    it('throws error if token is expired', async () => {
      verificationRepository.findValidVerificationToken.mockResolvedValue(null);

      await expect(verificationService.verifyEmail(mockUser.id, 'expired-token', mockRequestContext)).rejects.toThrow(
        /invalid or expired/i
      );
    });

    it('throws error if userId or token is missing', async () => {
      await expect(verificationService.verifyEmail(null, 'token', mockRequestContext)).rejects.toThrow();
    });

    it('records audit event on successful verification', async () => {
      const mockTokenRecord = {
        _id: 'token123',
        tokenHash: 'hashed-token-string',
        metadata: { email: mockUser.email },
      };

      verificationRepository.findValidVerificationToken.mockResolvedValue(mockTokenRecord);
      verificationRepository.markTokenUsed.mockResolvedValue({});
      userRepository.updateUserProfile.mockResolvedValue({});
      recordAuditEvent.mockResolvedValue({});

      await verificationService.verifyEmail(mockUser.id, 'raw-token', mockRequestContext);

      expect(recordAuditEvent).toHaveBeenCalled();
      const callArgs = recordAuditEvent.mock.calls[recordAuditEvent.mock.calls.length - 1][0];
      expect(callArgs.action).toContain('email.verify');
      expect(callArgs.result).toBe('succeeded');
    });

    it('records audit event on failed verification', async () => {
      verificationRepository.findValidVerificationToken.mockResolvedValue(null);
      recordAuditEvent.mockResolvedValue({});

      await expect(verificationService.verifyEmail(mockUser.id, 'invalid-token', mockRequestContext)).rejects.toThrow();

      expect(recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: expect.stringContaining('email.verify'),
          result: 'failed',
        })
      );
    });
  });

  describe('resendVerificationEmail', () => {
    it('resends verification email successfully', async () => {
      const mockTokenRecord = {
        _id: 'token123',
        userId: mockUser.id,
        tokenHash: 'hashed-token-string',
        expiresAt: new Date(Date.now() + 86400000),
      };

      verificationRepository.invalidatePreviousTokens.mockResolvedValue(1);
      verificationRepository.createVerificationToken.mockResolvedValue(mockTokenRecord);
      emailService.sendEmail.mockResolvedValue({});
      recordAuditEvent.mockResolvedValue({});

      const result = await verificationService.resendVerificationEmail(mockUser, mockRequestContext);

      expect(verificationRepository.invalidatePreviousTokens).toHaveBeenCalledWith(
        mockUser.id,
        VERIFICATION_TOKEN_TYPES.EMAIL
      );
      expect(result).toHaveProperty('tokenId');
      expect(result).toHaveProperty('expiresAt');
    });

    it('throws error if user is invalid', async () => {
      await expect(verificationService.resendVerificationEmail(null, mockRequestContext)).rejects.toThrow(
        AppError
      );
    });
  });

  describe('buildVerificationEmail', () => {
    it('builds verification email content', () => {
      const token = 'test-token';
      const result = verificationService.buildVerificationEmail(token, mockUser.name);

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('body');
      expect(result.html).toContain(mockUser.name);
      expect(result.body).toContain(mockUser.name);
    });
  });

  describe('buildVerificationLink', () => {
    it('builds verification link', () => {
      const token = 'test-token';
      const link = verificationService.buildVerificationLink(token);

      expect(link).toContain('/api/v1/email/verify');
      expect(link).toContain(`token=${token}`);
    });
  });
});
