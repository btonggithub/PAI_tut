const authorize = require('../../src/middleware/auth/authorize');

describe('authorize middleware', () => {
  it('calls next() when user has the required role', () => {
    const req = { user: { id: 'u1', role: 'admin' } };
    const next = jest.fn();

    authorize('admin')(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with 403 AppError when user role is not in allowed roles', () => {
    const req = { user: { id: 'u1', role: 'user' } };
    const next = jest.fn();

    authorize('admin')(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, isOperational: true })
    );
  });

  it('calls next with 401 AppError when req.user is missing', () => {
    const req = {};
    const next = jest.fn();

    authorize('admin')(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, isOperational: true })
    );
  });

  it('allows multiple roles and passes when user has one of them', () => {
    const req = { user: { id: 'u1', role: 'moderator' } };
    const next = jest.fn();

    authorize('admin', 'moderator')(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('blocks when user role is not in a multi-role list', () => {
    const req = { user: { id: 'u1', role: 'user' } };
    const next = jest.fn();

    authorize('admin', 'moderator')(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, isOperational: true })
    );
  });
});
