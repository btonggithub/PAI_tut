jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
}));

const jwtLib = require('jsonwebtoken');
const { signAccessToken } = require('../../src/utils/jwt');

describe('jwt utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signAccessToken injects type access into the payload', () => {
    const result = signAccessToken({ sub: 'u1' });

    expect(jwtLib.sign).toHaveBeenCalledWith(
      { sub: 'u1', type: 'access' },
      expect.any(String),
      { expiresIn: '15m' }
    );
    expect(result).toBe('signed-token');
  });
});