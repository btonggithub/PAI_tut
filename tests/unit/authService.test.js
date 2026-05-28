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

jest.mock('../../src/services/audit/auditLogService', () => ({
  recordAuditEvent: jest.fn().mockResolvedValue({}),
}));

const AppError = require('../../src/utils/AppError');
const authService = require('../../src/services/auth/authService');
const authRepository = require('../../src/repositories/auth/authRepository');
const sessionService = require('../../src/services/session/sessionService');
const { hashPassword, comparePassword } = require('../../src/utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../src/utils/jwt');
const { recordAuditEvent } = require('../../src/services/audit/auditLogService');
const crypto = require('crypto');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    sessionService.hashRefreshToken.mockReturnValue('bootstrap-hash');
    sessionService.createSession.mockResolvedValue({ sessionId: 'uuid-session-1' });
    sessionService.rotateSessionRefreshToken.mockResolvedValue({ sessionId: 'uuid-session-1' });
    signRefreshToken.mockReturnValue('refresh-token');
    
    verifyRefreshToken.mockReturnValue({
      sub: 'u1',
      sid: 'uuid-session-1',
      jti: 'uuid-jti-1',
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    });
    signAccessToken.mockReturnValue('access-token');
  });

  describe('register', () => {
    it('uses generated sessionId as refresh JWT sid instead of any persistence id', async () => {
      const randomUuidSpy = jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValueOnce('generated-session-id')
        .mockReturnValueOnce('generated-jti-id');

      authRepository.findUserByEmail.mockResolvedValue(null);
      hashPassword.mockResolvedValue('hashed-password');
      authRepository.createUser.mockResolvedValue({
        id: 'mongo-user-id',
        name: 'John',
        email: 'john@example.com',
        role: 'user',
        password: 'hashed-password',
      });
      sessionService.createSession.mockResolvedValue({
        id: 'mongo-session-object-id',
        sessionId: 'persisted-session-id',
      });

      await authService.register({
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(signRefreshToken).toHaveBeenCalledWith({
        sub: 'mongo-user-id',
        sid: 'generated-session-id',
        jti: 'generated-jti-id',
        type: 'refresh',
      });
      expect(signRefreshToken).not.toHaveBeenCalledWith(
        expect.objectContaining({ sid: 'mongo-session-object-id' })
      );

      randomUuidSpy.mockRestore();
    });

    it('registers user and returns safe user plus tokens', async () => {
      authRepository.findUserByEmail.mockResolvedValue(null);
      hashPassword.mockResolvedValue('hashed-password');
      authRepository.createUser.mockResolvedValue({
        id: 'u1',
        name: 'John',
        email: 'john@example.com',
        role: 'user',
        password: 'hashed-password',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      const result = await authService.register({
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('john@example.com');
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(authRepository.createUser).toHaveBeenCalledWith({
        name: 'John',
        email: 'john@example.com',
        password: 'hashed-password',
      });
      expect(sessionService.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          sessionId: expect.any(String),
          refreshTokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        })
      );
      
      expect(signRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'u1',
          sid: expect.any(String),
          jti: expect.any(String),
          type: 'refresh',
        })
      );
      expect(signAccessToken).toHaveBeenCalledWith({ sub: 'u1' });
      
      expect(sessionService.rotateSessionRefreshToken).not.toHaveBeenCalled();
      expect(result).toEqual({
        user: {
          id: 'u1',
          name: 'John',
          email: 'john@example.com',
          role: 'user',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
        token: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('throws AppError when email already exists', async () => {
      authRepository.findUserByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.register({
          name: 'John',
          email: 'john@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        message: 'Email already in use',
        statusCode: 409,
        isOperational: true,
      });
    });
  });

  describe('login', () => {
    it('returns safe user and tokens on valid credentials', async () => {
      authRepository.findUserByEmail.mockResolvedValue({
        id: 'u1',
        _id: { toString: () => 'u1' },
        name: 'John',
        email: 'john@example.com',
        role: 'user',
        password: 'hashed-password',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
      comparePassword.mockResolvedValue(true);

      const result = await authService.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(comparePassword).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(sessionService.createSession).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u1' })
      );
      
      expect(sessionService.rotateSessionRefreshToken).not.toHaveBeenCalled();
      expect(result).toEqual({
        user: {
          id: 'u1',
          name: 'John',
          email: 'john@example.com',
          role: 'user',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
        token: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('throws AppError on invalid credentials', async () => {
      authRepository.findUserByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'john@example.com', password: 'wrongpass' })
      ).rejects.toBeInstanceOf(AppError);

      await expect(
        authService.login({ email: 'john@example.com', password: 'wrongpass' })
      ).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      });
    });
  });

  describe('refresh', () => {
    it('rotates refresh token and returns new token pair', async () => {
      verifyRefreshToken.mockReturnValue({
        sub: 'u1',
        sid: 'session-1',
        jti: 'jti-old',
        type: 'refresh',
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      });
      signRefreshToken.mockReturnValue('next-refresh-token');
      signAccessToken.mockReturnValue('next-access-token');

      const result = await authService.refresh({ refreshToken: 'old-refresh-token' });

      expect(sessionService.validateRefreshSession).toHaveBeenCalledWith({
        sessionId: 'session-1',
        userId: 'u1',
        refreshToken: 'old-refresh-token',
      });
      
      expect(sessionService.rotateSessionRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-1',
          userId: 'u1',
          currentRefreshToken: 'old-refresh-token',
          refreshToken: 'next-refresh-token',
        })
      );
      
      expect(signRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'u1',
          sid: 'session-1',
          jti: expect.any(String),
          type: 'refresh',
        })
      );
      expect(result).toEqual({
        token: 'next-access-token',
        refreshToken: 'next-refresh-token',
      });
    });

    it('throws AppError when refresh token signature is invalid', async () => {
      verifyRefreshToken.mockImplementation(() => {
        throw new AppError('bad token', 401);
      });

      await expect(authService.refresh({ refreshToken: 'bad-token' })).rejects.toMatchObject({
        message: 'Invalid or expired refresh token',
        statusCode: 401,
      });
    });

    it('throws AppError when token type is not refresh', async () => {
      verifyRefreshToken.mockReturnValue({
        sub: 'u1',
        sid: 'session-1',
        type: 'access',
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      });

      await expect(authService.refresh({ refreshToken: 'access-token-used-as-refresh' })).rejects.toMatchObject({
        message: 'Invalid token type',
        statusCode: 401,
      });
    });
  });

  describe('logout', () => {
    it('revokes session for valid refresh token', async () => {
      verifyRefreshToken.mockReturnValue({
        sub: 'u1',
        sid: 'session-1',
        jti: 'jti-1',
        type: 'refresh',
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      });

      const result = await authService.logout({ refreshToken: 'valid-refresh-token' });

      expect(sessionService.validateRefreshSession).toHaveBeenCalledWith({
        sessionId: 'session-1',
        userId: 'u1',
        refreshToken: 'valid-refresh-token',
      });
      expect(sessionService.revokeSession).toHaveBeenCalledWith({
        sessionId: 'session-1',
        userId: 'u1',
      });
      expect(result).toEqual({ loggedOut: true });
    });

    it('throws AppError when refresh token signature is invalid', async () => {
      verifyRefreshToken.mockImplementation(() => {
        throw new AppError('bad token', 401);
      });

      await expect(authService.logout({ refreshToken: 'bad-token' })).rejects.toMatchObject({
        message: 'Invalid or expired refresh token',
        statusCode: 401,
      });
    });

    it('throws AppError when token type is not refresh', async () => {
      verifyRefreshToken.mockReturnValue({
        sub: 'u1',
        sid: 'session-1',
        type: 'access',
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      });

      await expect(authService.logout({ refreshToken: 'access-token-used-as-refresh' })).rejects.toMatchObject({
        message: 'Invalid token type',
        statusCode: 401,
      });
    });
  });
});
