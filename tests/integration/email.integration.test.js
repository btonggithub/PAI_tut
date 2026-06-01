jest.mock('../../src/services/auth/authService', () => ({
  getAuthUser: jest.fn(),
}));

jest.mock('../../src/services/email/verificationService', () => ({
  sendVerificationEmail: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerificationEmail: jest.fn(),
}));

jest.mock('../../src/services/audit/auditLogService', () => ({
  recordAuditEvent: jest.fn().mockResolvedValue({}),
}));

const request = require('supertest');
const app = require('../../src/app');
const { toAuthHeader } = require('../helpers/authHeader');
const { signAccessToken } = require('../../src/utils/jwt');
const authService = require('../../src/services/auth/authService');
const verificationService = require('../../src/services/email/verificationService');

const regularUser = {
  id: '64b7f5b9f1d2c3a4b5c6d7b2',
  name: 'Test User',
  email: 'user@example.com',
  role: 'user',
};

const accessHeaderFor = (userId) => toAuthHeader(signAccessToken({ sub: userId }));

describe('Email verification API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.getAuthUser.mockResolvedValue(regularUser);
  });

  describe('POST /api/v1/email/send-verification', () => {
    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/v1/email/send-verification')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('sends verification email successfully', async () => {
      const mockResult = {
        tokenId: 'token123',
        expiresAt: new Date(Date.now() + 86400000),
        sentAt: new Date(),
      };
      verificationService.sendVerificationEmail.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/email/send-verification')
        .set(accessHeaderFor(regularUser.id))
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Verification email sent');
      expect(verificationService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('returns error if email send fails', async () => {
      const error = new Error('Failed to send email');
      verificationService.sendVerificationEmail.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/v1/email/send-verification')
        .set(accessHeaderFor(regularUser.id))
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/email/verify', () => {
    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/v1/email/verify')
        .query({ token: 'some-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('requires token query parameter', async () => {
      const response = await request(app)
        .post('/api/v1/email/verify')
        .set(accessHeaderFor(regularUser.id));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('verifies email successfully', async () => {
      const mockResult = {
        userId: regularUser.id,
        verifiedAt: new Date(),
        email: regularUser.email,
      };
      verificationService.verifyEmail.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/email/verify')
        .set(accessHeaderFor(regularUser.id))
        .query({ token: 'verification-token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Email verified');
      expect(verificationService.verifyEmail).toHaveBeenCalledWith(
        regularUser.id,
        'verification-token',
        expect.any(Object)
      );
    });

    it('returns error for invalid token', async () => {
      const error = new Error('Invalid or expired verification token');
      error.statusCode = 400;
      verificationService.verifyEmail.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/v1/email/verify')
        .set(accessHeaderFor(regularUser.id))
        .query({ token: 'invalid-token' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/email/resend-verification', () => {
    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/v1/email/resend-verification')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('resends verification email successfully', async () => {
      const mockResult = {
        tokenId: 'token456',
        expiresAt: new Date(Date.now() + 86400000),
        sentAt: new Date(),
      };
      verificationService.resendVerificationEmail.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/email/resend-verification')
        .set(accessHeaderFor(regularUser.id))
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Verification email resent');
      expect(verificationService.resendVerificationEmail).toHaveBeenCalled();
    });
  });
});
