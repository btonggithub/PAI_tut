jest.mock('../../src/repositories/auth/authRepository', () => ({
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock('../../src/services/session/sessionService', () => ({
  hashRefreshToken: jest.fn(),
  createSession: jest.fn(),
  rotateSessionRefreshToken: jest.fn(),
  validateRefreshSession: jest.fn(),
  revokeSession: jest.fn(),
}));

jest.mock('../../src/utils/password', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../../src/utils/jwt', () => ({
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.mock('../../src/repositories/email/verificationRepository', () => ({
  findVerificationTokenByHash: jest.fn(),
  markTokenUsed: jest.fn(),
  invalidatePreviousTokens: jest.fn(),
  createVerificationToken: jest.fn(),
}));

jest.mock('../../src/repositories/user/userRepository', () => ({
  updateUserProfile: jest.fn(),
}));

jest.mock('../../src/services/email/emailService', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('../../src/utils/token', () => ({
  generateToken: jest.fn(),
  hashToken: jest.fn(),
}));

jest.mock('../../src/services/audit/auditLogService', () => ({
  recordAuditEvent: jest.fn().mockResolvedValue({}),
}));

const request = require('supertest');
const app = require('../../src/app');
const authRepository = require('../../src/repositories/auth/authRepository');
const sessionService = require('../../src/services/session/sessionService');
const { hashPassword } = require('../../src/utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../src/utils/jwt');
const verificationRepository = require('../../src/repositories/email/verificationRepository');
const userRepository = require('../../src/repositories/user/userRepository');
const { hashToken } = require('../../src/utils/token');
const { eventBus, DOMAIN_EVENT_NAMES } = require('../../src/services/event');
const { VERIFICATION_TOKEN_TYPES } = require('../../src/models/verificationTokenModel');

describe('Domain events integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventBus.clearHandlers();
    eventBus.resetMetrics();

    sessionService.hashRefreshToken.mockReturnValue('refresh-token-hash');
    sessionService.createSession.mockResolvedValue({ sessionId: 'session-1' });
    signRefreshToken.mockReturnValue('refresh-token');
    verifyRefreshToken.mockReturnValue({
      sub: 'user-1',
      sid: 'session-1',
      jti: 'jti-1',
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    });
    signAccessToken.mockReturnValue('access-token');
  });

  afterEach(() => {
    eventBus.clearHandlers();
    eventBus.resetMetrics();
  });

  it('publishes user.registered.v1 after successful registration without changing response contract', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    eventBus.subscribe(DOMAIN_EVENT_NAMES.USER_REGISTERED_V1, handler);

    authRepository.findUserByEmail.mockResolvedValue(null);
    hashPassword.mockResolvedValue('hashed-password');
    authRepository.createUser.mockResolvedValue({
      id: 'user-1',
      name: 'Jane',
      email: 'jane@example.com',
      role: 'user',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .set('x-correlation-id', 'register-request-1')
      .send({
        name: 'Jane',
        email: 'jane@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('token', 'access-token');
    expect(response.body.data).toHaveProperty('refreshToken', 'refresh-token');

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      name: DOMAIN_EVENT_NAMES.USER_REGISTERED_V1,
      version: 'v1',
      owner: { domain: 'user' },
      actor: { id: 'user-1', role: 'user' },
      resource: { type: 'user', id: 'user-1' },
      metadata: expect.objectContaining({
        email: 'jane@example.com',
        role: 'user',
        emailVerified: false,
      }),
      correlationId: 'register-request-1',
      occurredAt: expect.any(String),
    }));
  });

  it('publishes user.email_verified.v1 after successful email verification without changing response contract', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    eventBus.subscribe(DOMAIN_EVENT_NAMES.USER_EMAIL_VERIFIED_V1, handler);

    hashToken.mockReturnValue('hashed-verification-token');
    verificationRepository.findVerificationTokenByHash.mockResolvedValue({
      _id: 'verification-token-1',
      userId: 'user-1',
      tokenHash: 'hashed-verification-token',
      metadata: { email: 'jane@example.com' },
    });
    verificationRepository.markTokenUsed.mockResolvedValue({});
    userRepository.updateUserProfile.mockResolvedValue({
      id: 'user-1',
      role: 'user',
      email: 'jane@example.com',
      emailVerified: true,
    });

    const response = await request(app)
      .get('/api/v1/email/verify')
      .set('x-correlation-id', 'verify-request-1')
      .query({ token: 'raw-verification-token' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({
      userId: 'user-1',
      email: 'jane@example.com',
    }));
    expect(verificationRepository.findVerificationTokenByHash).toHaveBeenCalledWith(
      'hashed-verification-token',
      VERIFICATION_TOKEN_TYPES.EMAIL
    );

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      name: DOMAIN_EVENT_NAMES.USER_EMAIL_VERIFIED_V1,
      version: 'v1',
      owner: { domain: 'user' },
      actor: { id: 'user-1', role: 'user' },
      resource: { type: 'user', id: 'user-1' },
      metadata: { email: 'jane@example.com' },
      correlationId: 'verify-request-1',
      occurredAt: expect.any(String),
    }));
  });
});
