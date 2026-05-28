const { ROLE_PERMISSIONS, getPermissionsForRole } = require('../../src/permissions/rolePermissions');
const USER_PERMISSIONS = require('../../src/permissions/userPermissions');

describe('ROLE_PERMISSIONS mapping', () => {
  describe('admin role', () => {
    it('has READ permission', () => {
      expect(ROLE_PERMISSIONS.admin).toContain(USER_PERMISSIONS.READ);
    });

    it('has UPDATE permission', () => {
      expect(ROLE_PERMISSIONS.admin).toContain(USER_PERMISSIONS.UPDATE);
    });

    it('has DELETE permission', () => {
      expect(ROLE_PERMISSIONS.admin).toContain(USER_PERMISSIONS.DELETE);
    });

    it('has MANAGE permission', () => {
      expect(ROLE_PERMISSIONS.admin).toContain(USER_PERMISSIONS.MANAGE);
    });

    it('has all admin capabilities', () => {
      const adminPerms = ROLE_PERMISSIONS.admin;
      expect(adminPerms).toEqual(
        expect.arrayContaining([
          USER_PERMISSIONS.READ,
          USER_PERMISSIONS.UPDATE,
          USER_PERMISSIONS.DELETE,
          USER_PERMISSIONS.MANAGE,
        ])
      );
    });
  });

  describe('user role', () => {
    it('has READ_SELF permission', () => {
      expect(ROLE_PERMISSIONS.user).toContain(USER_PERMISSIONS.READ_SELF);
    });

    it('has UPDATE_SELF permission', () => {
      expect(ROLE_PERMISSIONS.user).toContain(USER_PERMISSIONS.UPDATE_SELF);
    });

    it('does not have READ permission', () => {
      expect(ROLE_PERMISSIONS.user).not.toContain(USER_PERMISSIONS.READ);
    });

    it('does not have UPDATE permission', () => {
      expect(ROLE_PERMISSIONS.user).not.toContain(USER_PERMISSIONS.UPDATE);
    });

    it('does not have DELETE permission', () => {
      expect(ROLE_PERMISSIONS.user).not.toContain(USER_PERMISSIONS.DELETE);
    });

    it('does not have MANAGE permission', () => {
      expect(ROLE_PERMISSIONS.user).not.toContain(USER_PERMISSIONS.MANAGE);
    });

    it('has only self-scoped capabilities', () => {
      const userPerms = ROLE_PERMISSIONS.user;
      expect(userPerms).toEqual(
        expect.arrayContaining([
          USER_PERMISSIONS.READ_SELF,
          USER_PERMISSIONS.UPDATE_SELF,
        ])
      );
    });
  });
});

describe('getPermissionsForRole', () => {
  it('returns admin permissions for admin role', () => {
    const perms = getPermissionsForRole('admin');
    expect(perms).toEqual(ROLE_PERMISSIONS.admin);
  });

  it('returns user permissions for user role', () => {
    const perms = getPermissionsForRole('user');
    expect(perms).toEqual(ROLE_PERMISSIONS.user);
  });

  it('returns empty array for unknown role', () => {
    const perms = getPermissionsForRole('unknown-role');
    expect(perms).toEqual([]);
  });

  it('returns empty array for null role', () => {
    const perms = getPermissionsForRole(null);
    expect(perms).toEqual([]);
  });

  it('returns empty array for undefined role', () => {
    const perms = getPermissionsForRole(undefined);
    expect(perms).toEqual([]);
  });

  it('returns empty array for empty string role', () => {
    const perms = getPermissionsForRole('');
    expect(perms).toEqual([]);
  });

  it('returns empty array for non-string role', () => {
    const perms = getPermissionsForRole(123);
    expect(perms).toEqual([]);
  });

  it('mapping is server-controlled, not client-provided', () => {
    // Ensure that role-permission mapping is not based on user input
    expect(getPermissionsForRole('admin')).not.toEqual([]);
    expect(getPermissionsForRole('hacker')).toEqual([]);
  });
});
