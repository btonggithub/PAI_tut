jest.mock('../../src/repositories/session/sessionRepository', () => ({
  createSession: jest.fn(),
  findActiveSessionByIdAndUser: jest.fn(),
  rotateSessionRefreshToken: jest.fn(),
  revokeSessionByIdAndUser: jest.fn(),
}));

const sessionService = require('../../src/services/session/sessionService');
const sessionRepository = require('../../src/repositories/session/sessionRepository');

describe('sessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const buildAtomicRotationMocks = () => {
    const storedSession = {
      sessionId: 's1',
      userId: 'u1',
      revokedAt: null,
      expiresAt: new Date('2027-01-01T00:00:00.000Z'),
      refreshTokenHash: sessionService.hashRefreshToken('old-refresh-token'),
    };

    sessionRepository.findActiveSessionByIdAndUser.mockImplementation((sessionId, userId) => {
      const isActive =
        storedSession.sessionId === sessionId &&
        storedSession.userId === userId &&
        storedSession.revokedAt === null &&
        storedSession.expiresAt > new Date();

      return isActive ? { ...storedSession } : null;
    });

    sessionRepository.rotateSessionRefreshToken.mockImplementation(
      async (sessionId, userId, currentHash, nextHash, expiresAt) => {
        const matchesCurrentSession =
          storedSession.sessionId === sessionId &&
          storedSession.userId === userId &&
          storedSession.revokedAt === null &&
          storedSession.expiresAt > new Date() &&
          storedSession.refreshTokenHash === currentHash;

        if (!matchesCurrentSession) {
          return null;
        }

        storedSession.refreshTokenHash = nextHash;
        storedSession.expiresAt = expiresAt;

        return { ...storedSession };
      }
    );

    return storedSession;
  };

  it('hashRefreshToken returns deterministic hash', () => {
    const token = 'refresh-token';

    const hashA = sessionService.hashRefreshToken(token);
    const hashB = sessionService.hashRefreshToken(token);

    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe(token);
  });

  it('createSession delegates to repository', async () => {
    const payload = {
      userId: 'u1',
      sessionId: 's1',
      refreshTokenHash: 'hashed-token',
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
    };
    sessionRepository.createSession.mockResolvedValue({ id: 'doc-id', ...payload });

    const result = await sessionService.createSession(payload);

    expect(sessionRepository.createSession).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ id: 'doc-id', ...payload });
  });

  it('createSession rejects missing sessionId for new sessions', async () => {
    await expect(
      sessionService.createSession({
        userId: 'u1',
        refreshTokenHash: 'hashed-token',
        expiresAt: new Date('2026-12-31T00:00:00.000Z'),
      })
    ).rejects.toThrow('sessionID is required');
  });

  it('validateRefreshSession throws for missing active session', async () => {
    sessionRepository.findActiveSessionByIdAndUser.mockResolvedValue(null);

    await expect(
      sessionService.validateRefreshSession({
        sessionId: 's1',
        userId: 'u1',
        refreshToken: 'refresh-token',
      })
    ).rejects.toMatchObject({
      message: 'Invalid refresh token',
      statusCode: 401,
    });
  });

  it('validateRefreshSession throws for mismatched token hash', async () => {
    sessionRepository.findActiveSessionByIdAndUser.mockResolvedValue({
      id: 's1',
      userId: 'u1',
      refreshTokenHash: sessionService.hashRefreshToken('different-token'),
    });

    await expect(
      sessionService.validateRefreshSession({
        sessionId: 's1',
        userId: 'u1',
        refreshToken: 'refresh-token',
      })
    ).rejects.toMatchObject({
      message: 'Invalid refresh token',
      statusCode: 401,
    });
  });

  it('validateRefreshSession returns active session for valid token hash', async () => {
    const refreshToken = 'refresh-token';
    const session = {
      id: 's1',
      userId: 'u1',
      refreshTokenHash: sessionService.hashRefreshToken(refreshToken),
    };
    sessionRepository.findActiveSessionByIdAndUser.mockResolvedValue(session);

    const result = await sessionService.validateRefreshSession({
      sessionId: 's1',
      userId: 'u1',
      refreshToken,
    });

    expect(result).toEqual(session);
  });

  it('rotateSessionRefreshToken rotates hash in repository atomically', async () => {
    const expiresAt = new Date('2026-12-31T00:00:00.000Z');
    sessionRepository.rotateSessionRefreshToken.mockResolvedValue({ id: 's1' });

    const result = await sessionService.rotateSessionRefreshToken({
      sessionId: 's1',
      userId: 'u1',
      currentRefreshToken: 'current-refresh-token',
      refreshToken: 'next-refresh-token',
      expiresAt,
    });

    expect(sessionRepository.rotateSessionRefreshToken).toHaveBeenCalledWith(
      's1',
      'u1',
      sessionService.hashRefreshToken('current-refresh-token'),
      sessionService.hashRefreshToken('next-refresh-token'),
      expiresAt
    );
    expect(result).toEqual({ id: 's1' });
  });

  it('rotateSessionRefreshToken throws when repository cannot atomically match current hash', async () => {
    sessionRepository.rotateSessionRefreshToken.mockResolvedValue(null);

    await expect(
      sessionService.rotateSessionRefreshToken({
        sessionId: 's1',
        userId: 'u1',
        currentRefreshToken: 'old-refresh-token',
        refreshToken: 'next-refresh-token',
        expiresAt: new Date('2026-12-31T00:00:00.000Z'),
      })
    ).rejects.toMatchObject({
      message: 'Invalid refresh token',
      statusCode: 401,
    });
  });

  it('rejects reuse of the old refresh token after rotation', async () => {
    buildAtomicRotationMocks();

    await sessionService.rotateSessionRefreshToken({
      sessionId: 's1',
      userId: 'u1',
      currentRefreshToken: 'old-refresh-token',
      refreshToken: 'next-refresh-token',
      expiresAt: new Date('2027-06-01T00:00:00.000Z'),
    });

    await expect(
      sessionService.validateRefreshSession({
        sessionId: 's1',
        userId: 'u1',
        refreshToken: 'old-refresh-token',
      })
    ).rejects.toMatchObject({
      message: 'Invalid refresh token',
      statusCode: 401,
    });

    await expect(
      sessionService.validateRefreshSession({
        sessionId: 's1',
        userId: 'u1',
        refreshToken: 'next-refresh-token',
      })
    ).resolves.toMatchObject({
      sessionId: 's1',
      userId: 'u1',
    });
  });

  it('rejects a second refresh rotation attempt with the same old token', async () => {
    buildAtomicRotationMocks();

    await sessionService.rotateSessionRefreshToken({
      sessionId: 's1',
      userId: 'u1',
      currentRefreshToken: 'old-refresh-token',
      refreshToken: 'next-refresh-token',
      expiresAt: new Date('2027-06-01T00:00:00.000Z'),
    });

    await expect(
      sessionService.rotateSessionRefreshToken({
        sessionId: 's1',
        userId: 'u1',
        currentRefreshToken: 'old-refresh-token',
        refreshToken: 'nexter-refresh-token',
        expiresAt: new Date('2027-07-01T00:00:00.000Z'),
      })
    ).rejects.toMatchObject({
      message: 'Invalid refresh token',
      statusCode: 401,
    });
  });

  it('revokeSession revokes active session', async () => {
    sessionRepository.revokeSessionByIdAndUser.mockResolvedValue({ id: 's1', revokedAt: new Date() });

    const result = await sessionService.revokeSession({ sessionId: 's1', userId: 'u1' });

    expect(sessionRepository.revokeSessionByIdAndUser).toHaveBeenCalledWith('s1', 'u1');
    expect(result).toHaveProperty('id', 's1');
  });
});
