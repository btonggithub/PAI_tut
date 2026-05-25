jest.mock('../../src/models/sessionModel', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

const Session = require('../../src/models/sessionModel');
const sessionRepository = require('../../src/repositories/session/sessionRepository');

describe('sessionRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a session with storage-independent sessionId', async () => {
    const payload = {
      userId: 'u1',
      sessionId: 'session-uuid',
      refreshTokenHash: 'hashed-refresh-token',
      expiresAt: new Date('2027-01-01T00:00:00.000Z'),
    };
    Session.create.mockResolvedValue({ id: 'mongo-id', ...payload });

    await sessionRepository.createSession(payload);

    expect(Session.create).toHaveBeenCalledWith(payload);
  });

  it('rotates a refresh token only when the current hash still matches', async () => {
    const lean = jest.fn().mockResolvedValue({ id: 'mongo-id' });
    Session.findOneAndUpdate.mockReturnValue({ lean });

    await sessionRepository.rotateSessionRefreshToken(
      'session-uuid',
      'u1',
      'current-hash',
      'next-hash',
      new Date('2027-02-01T00:00:00.000Z')
    );

    expect(Session.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-uuid',
        userId: 'u1',
        refreshTokenHash: 'current-hash',
        revokedAt: null,
      }),
      {
        $set: {
          refreshTokenHash: 'next-hash',
          expiresAt: new Date('2027-02-01T00:00:00.000Z'),
        },
      },
      {
        new: true,
      }
    );

    const [filter] = Session.findOneAndUpdate.mock.calls[0];

    expect(filter._id).toBeUndefined();
    expect(filter.expiresAt.$gt).toBeInstanceOf(Date);
  });
});