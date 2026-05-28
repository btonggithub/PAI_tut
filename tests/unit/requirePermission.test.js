const requirePermission = require('../../src/middleware/auth/requirePermission');
const { USER_PERMISSIONS } = require('../../src/permissions');

describe('requirePermission middleware', () => {
  describe('authenticated user with permission', () => {
    it('calls next() when user has required permission', () => {
      const req = { user: { id: 'admin-1', role: 'admin' } };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.READ)(req, {}, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('calls next() for admin user with READ permission', () => {
      const req = { user: { id: 'admin-1', role: 'admin' } };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.READ)(req, {}, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('calls next() for regular user with READ_SELF permission', () => {
      const req = { user: { id: 'user-1', role: 'user' } };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.READ_SELF)(req, {}, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('authenticated user without permission', () => {
    it('calls next with 403 AppError when user lacks permission', () => {
      const req = { user: { id: 'user-1', role: 'user' } };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.READ)(req, {}, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403, isOperational: true })
      );
    });

    it('calls next with 403 for regular user trying READ permission', () => {
      const req = { user: { id: 'user-1', role: 'user' } };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.MANAGE)(req, {}, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403, isOperational: true })
      );
    });

    it('calls next with 403 for user trying DELETE permission', () => {
      const req = { user: { id: 'user-1', role: 'user' } };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.DELETE)(req, {}, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403, isOperational: true })
      );
    });
  });

  describe('unauthenticated user', () => {
    it('calls next with 401 AppError when req.user is missing', () => {
      const req = {};
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.READ)(req, {}, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, isOperational: true })
      );
    });

    it('calls next with 401 when req.user is null', () => {
      const req = { user: null };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.READ)(req, {}, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, isOperational: true })
      );
    });

    it('calls next with 401 when req.user is undefined', () => {
      const req = { user: undefined };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.READ)(req, {}, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, isOperational: true })
      );
    });
  });

  describe('permission constants', () => {
    it('works with USER_PERMISSIONS.READ constant', () => {
      const req = { user: { id: 'admin-1', role: 'admin' } };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.READ)(req, {}, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('works with USER_PERMISSIONS.MANAGE constant', () => {
      const req = { user: { id: 'admin-1', role: 'admin' } };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.MANAGE)(req, {}, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('works with USER_PERMISSIONS.UPDATE_SELF constant', () => {
      const req = { user: { id: 'user-1', role: 'user' } };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.UPDATE_SELF)(req, {}, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('error messages', () => {
    it('includes Authentication required in 401 error', () => {
      const req = {};
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.READ)(req, {}, next);

      const error = next.mock.calls[0][0];
      expect(error.message).toContain('Authentication');
    });

    it('includes Forbidden in 403 error', () => {
      const req = { user: { id: 'user-1', role: 'user' } };
      const next = jest.fn();

      requirePermission(USER_PERMISSIONS.READ)(req, {}, next);

      const error = next.mock.calls[0][0];
      expect(error.message).toContain('Forbidden');
    });
  });

  describe('reusability', () => {
    it('returns a middleware function', () => {
      const middleware = requirePermission(USER_PERMISSIONS.READ);
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // (req, res, next)
    });

    it('creates independent middleware instances', () => {
      const middleware1 = requirePermission(USER_PERMISSIONS.READ);
      const middleware2 = requirePermission(USER_PERMISSIONS.MANAGE);

      expect(middleware1).not.toBe(middleware2);
    });

    it('can be used multiple times for different permissions', () => {
      const req = { user: { id: 'admin-1', role: 'admin' } };
      const next1 = jest.fn();
      const next2 = jest.fn();

      requirePermission(USER_PERMISSIONS.READ)(req, {}, next1);
      requirePermission(USER_PERMISSIONS.MANAGE)(req, {}, next2);

      expect(next1).toHaveBeenCalledWith();
      expect(next2).toHaveBeenCalledWith();
    });
  });
});
