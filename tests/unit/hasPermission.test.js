const hasPermission = require('../../src/permissions/hasPermission');
const USER_PERMISSIONS = require('../../src/permissions/userPermissions');

describe('hasPermission', () => {
  describe('admin user', () => {
    const admin = { id: 'admin-1', role: 'admin' };

    it('returns true for READ permission', () => {
      expect(hasPermission(admin, USER_PERMISSIONS.READ)).toBe(true);
    });

    it('returns true for UPDATE permission', () => {
      expect(hasPermission(admin, USER_PERMISSIONS.UPDATE)).toBe(true);
    });

    it('returns true for DELETE permission', () => {
      expect(hasPermission(admin, USER_PERMISSIONS.DELETE)).toBe(true);
    });

    it('returns true for MANAGE permission', () => {
      expect(hasPermission(admin, USER_PERMISSIONS.MANAGE)).toBe(true);
    });

    it('returns true for READ_SELF permission', () => {
      expect(hasPermission(admin, USER_PERMISSIONS.READ_SELF)).toBe(true);
    });

    it('returns true for UPDATE_SELF permission', () => {
      expect(hasPermission(admin, USER_PERMISSIONS.UPDATE_SELF)).toBe(true);
    });
  });

  describe('regular user', () => {
    const user = { id: 'user-1', role: 'user' };

    it('returns false for READ permission', () => {
      expect(hasPermission(user, USER_PERMISSIONS.READ)).toBe(false);
    });

    it('returns false for UPDATE permission', () => {
      expect(hasPermission(user, USER_PERMISSIONS.UPDATE)).toBe(false);
    });

    it('returns false for DELETE permission', () => {
      expect(hasPermission(user, USER_PERMISSIONS.DELETE)).toBe(false);
    });

    it('returns false for MANAGE permission', () => {
      expect(hasPermission(user, USER_PERMISSIONS.MANAGE)).toBe(false);
    });

    it('returns true for READ_SELF permission', () => {
      expect(hasPermission(user, USER_PERMISSIONS.READ_SELF)).toBe(true);
    });

    it('returns true for UPDATE_SELF permission', () => {
      expect(hasPermission(user, USER_PERMISSIONS.UPDATE_SELF)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('returns false when actor is null', () => {
      expect(hasPermission(null, USER_PERMISSIONS.READ)).toBe(false);
    });

    it('returns false when actor is undefined', () => {
      expect(hasPermission(undefined, USER_PERMISSIONS.READ)).toBe(false);
    });

    it('returns false when actor.role is null', () => {
      const actor = { id: 'user-1', role: null };
      expect(hasPermission(actor, USER_PERMISSIONS.READ)).toBe(false);
    });

    it('returns false when actor.role is undefined', () => {
      const actor = { id: 'user-1' };
      expect(hasPermission(actor, USER_PERMISSIONS.READ)).toBe(false);
    });

    it('returns false when permission is null', () => {
      const actor = { id: 'admin-1', role: 'admin' };
      expect(hasPermission(actor, null)).toBe(false);
    });

    it('returns false when permission is undefined', () => {
      const actor = { id: 'admin-1', role: 'admin' };
      expect(hasPermission(actor, undefined)).toBe(false);
    });

    it('returns false when permission is empty string', () => {
      const actor = { id: 'admin-1', role: 'admin' };
      expect(hasPermission(actor, '')).toBe(false);
    });

    it('returns false when actor.role is unknown', () => {
      const actor = { id: 'unknown-1', role: 'unknown-role' };
      expect(hasPermission(actor, USER_PERMISSIONS.READ)).toBe(false);
    });

    it('returns false for permission not in role permissions', () => {
      const actor = { id: 'user-1', role: 'user' };
      expect(hasPermission(actor, 'some.nonexistent.permission')).toBe(false);
    });
  });

  describe('security', () => {
    it('does not trust actor.permissions field', () => {
      // If a user tries to add a permissions field directly, it should be ignored
      const maliciousActor = {
        id: 'hacker-1',
        role: 'user',
        permissions: ['user.manage', 'user.delete'],
      };

      expect(hasPermission(maliciousActor, USER_PERMISSIONS.MANAGE)).toBe(false);
      expect(hasPermission(maliciousActor, USER_PERMISSIONS.DELETE)).toBe(false);
    });
  });

  describe('pure function behavior', () => {
    const actor = { id: 'admin-1', role: 'admin' };
    const permission = USER_PERMISSIONS.READ;

    it('returns consistent results for same inputs', () => {
      const result1 = hasPermission(actor, permission);
      const result2 = hasPermission(actor, permission);
      const result3 = hasPermission(actor, permission);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('does not modify actor object', () => {
      const originalActor = { id: 'admin-1', role: 'admin' };
      const actorCopy = { ...originalActor };

      hasPermission(originalActor, permission);

      expect(originalActor).toEqual(actorCopy);
    });
  });
});
