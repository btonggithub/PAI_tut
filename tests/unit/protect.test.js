jest.mock('../../src/utils/jwt', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../../src/middleware/auth/extractBearerToken', () => jest.fn());

jest.mock('../../src/services/auth/authService', () => ({
  getAuthUser: jest.fn(),
}));

const protect = require('../../src/middleware/auth/protect');
const { verifyToken } = require('../../src/utils/jwt');
const extractBearerToken = require('../../src/middleware/auth/extractBearerToken');
const authService = require('../../src/services/auth/authService');

const mockUser = {
  id: 'u1',
  email: 'john@example.com',
  name: 'John',
  role: 'user',
};

describe('protect middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: { authorization: 'Bearer valid-token' } };
    res = {};
    next = jest.fn();
    extractBearerToken.mockReturnValue('valid-token');
    authService.getAuthUser.mockResolvedValue(mockUser);
  });

  it('calls next() and sets req.user for a valid access token', async () => {
    verifyToken.mockReturnValue({ sub: 'u1', type: 'access' });

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({
      id: 'u1',
      email: 'john@example.com',
      name: 'John',
      role: 'user',
    });
  });

  it('rejects a refresh token with 401 (type confusion)', async () => {
    verifyToken.mockReturnValue({ sub: 'u1', type: 'refresh' });

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, isOperational: true })
    );
    expect(req.user).toBeUndefined();
    expect(authService.getAuthUser).not.toHaveBeenCalled();
  });

  it('rejects a token with no type field with 401', async () => {
    verifyToken.mockReturnValue({ sub: 'u1' });

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, isOperational: true })
    );
    expect(req.user).toBeUndefined();
  });

  it('rejects a token with missing sub with 401', async () => {
    verifyToken.mockReturnValue({ type: 'access' });

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, isOperational: true })
    );
    expect(req.user).toBeUndefined();
  });

  it('forwards AppError when extractBearerToken throws', async () => {
    const AppError = require('../../src/utils/AppError');
    extractBearerToken.mockImplementation(() => {
      throw new AppError('Authorization token is missing', 401);
    });

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, isOperational: true })
    );
  });
});
