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
      refreshTokenHash: 'hashed-token',
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
    };
    sessionRepository.createSession.mockResolvedValue({ id: 's1', ...payload });

    const result = await sessionService.createSession(payload);

    expect(sessionRepository.createSession).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ id: 's1', ...payload });
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

  it('rotateSessionRefreshToken rotates hash in repository', async () => {
    const expiresAt = new Date('2026-12-31T00:00:00.000Z');
    sessionRepository.rotateSessionRefreshToken.mockResolvedValue({ id: 's1' });

    const result = await sessionService.rotateSessionRefreshToken({
      sessionId: 's1',
      userId: 'u1',
      refreshToken: 'next-refresh-token',
      expiresAt,
    });

    expect(sessionRepository.rotateSessionRefreshToken).toHaveBeenCalledWith(
      's1',
      'u1',
      sessionService.hashRefreshToken('next-refresh-token'),
      expiresAt
    );
    expect(result).toEqual({ id: 's1' });
  });

  it('revokeSession revokes active session', async () => {
    sessionRepository.revokeSessionByIdAndUser.mockResolvedValue({ id: 's1', revokedAt: new Date() });

    const result = await sessionService.revokeSession({ sessionId: 's1', userId: 'u1' });

    expect(sessionRepository.revokeSessionByIdAndUser).toHaveBeenCalledWith('s1', 'u1');
    expect(result).toHaveProperty('id', 's1');
  });
});
