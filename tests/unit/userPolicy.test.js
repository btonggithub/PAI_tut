const {
  canViewUser,
  canUpdateUser,
  canDeleteUser,
  canManageUsers,
} = require('../../src/policies/userPolicy');
const { hasPermission, USER_PERMISSIONS } = require('../../src/permissions');

describe('userPolicy', () => {
  describe('canViewUser', () => {
    it('returns false when actor is null', () => {
      expect(canViewUser(null, 'user-123')).toBe(false);
    });

    it('returns true when admin views any user', () => {
      const admin = { id: 'admin-1', role: 'admin' };
      expect(hasPermission(admin, USER_PERMISSIONS.READ)).toBe(true);
      expect(canViewUser(admin, 'user-123')).toBe(true);
      expect(canViewUser(admin, 'user-456')).toBe(true);
    });

    it('returns true when user views own profile', () => {
      const user = { id: 'user-123', role: 'user' };
      expect(hasPermission(user, USER_PERMISSIONS.READ_SELF)).toBe(true);
      expect(canViewUser(user, 'user-123')).toBe(true);
    });

    it('returns false when user tries to view another user profile', () => {
      const user = { id: 'user-123', role: 'user' };
      expect(canViewUser(user, 'user-456')).toBe(false);
    });
  });

  describe('canUpdateUser', () => {
    it('returns false when actor is null', () => {
      expect(canUpdateUser(null, 'user-123')).toBe(false);
    });

    it('returns true when admin updates any user', () => {
      const admin = { id: 'admin-1', role: 'admin' };
      expect(hasPermission(admin, USER_PERMISSIONS.UPDATE)).toBe(true);
      expect(canUpdateUser(admin, 'user-123')).toBe(true);
      expect(canUpdateUser(admin, 'user-456')).toBe(true);
    });

    it('returns true when user updates own profile', () => {
      const user = { id: 'user-123', role: 'user' };
      expect(hasPermission(user, USER_PERMISSIONS.UPDATE_SELF)).toBe(true);
      expect(canUpdateUser(user, 'user-123')).toBe(true);
    });

    it('returns false when user tries to update another user profile', () => {
      const user = { id: 'user-123', role: 'user' };
      expect(canUpdateUser(user, 'user-456')).toBe(false);
    });
  });

  describe('canDeleteUser', () => {
    it('returns false when actor is null', () => {
      expect(canDeleteUser(null)).toBe(false);
    });

    it('returns true when admin deletes user', () => {
      const admin = { id: 'admin-1', role: 'admin' };
      expect(hasPermission(admin, USER_PERMISSIONS.DELETE)).toBe(true);
      expect(canDeleteUser(admin)).toBe(true);
    });

    it('returns false when regular user tries to delete', () => {
      const user = { id: 'user-123', role: 'user' };
      expect(canDeleteUser(user)).toBe(false);
    });

    it('returns false when user tries to delete own profile', () => {
      const user = { id: 'user-123', role: 'user' };
      expect(canDeleteUser(user)).toBe(false);
    });
  });

  describe('canManageUsers', () => {
    it('returns false when actor is null', () => {
      expect(canManageUsers(null)).toBe(false);
    });

    it('returns true when admin manages users', () => {
      const admin = { id: 'admin-1', role: 'admin' };
      expect(hasPermission(admin, USER_PERMISSIONS.MANAGE)).toBe(true);
      expect(canManageUsers(admin)).toBe(true);
    });

    it('returns false when regular user tries to manage users', () => {
      const user = { id: 'user-123', role: 'user' };
      expect(canManageUsers(user)).toBe(false);
    });
  });
});
