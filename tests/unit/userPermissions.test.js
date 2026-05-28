const USER_PERMISSIONS = require('../../src/permissions/userPermissions');

describe('USER_PERMISSIONS constants', () => {
  it('defines READ permission', () => {
    expect(USER_PERMISSIONS.READ).toBe('user.read');
  });

  it('defines READ_SELF permission', () => {
    expect(USER_PERMISSIONS.READ_SELF).toBe('user.read.self');
  });

  it('defines UPDATE permission', () => {
    expect(USER_PERMISSIONS.UPDATE).toBe('user.update');
  });

  it('defines UPDATE_SELF permission', () => {
    expect(USER_PERMISSIONS.UPDATE_SELF).toBe('user.update.self');
  });

  it('defines DELETE permission', () => {
    expect(USER_PERMISSIONS.DELETE).toBe('user.delete');
  });

  it('defines MANAGE permission', () => {
    expect(USER_PERMISSIONS.MANAGE).toBe('user.manage');
  });

  it('follows resource.action format', () => {
    Object.values(USER_PERMISSIONS).forEach((permission) => {
      expect(permission).toMatch(/^user\./);
    });
  });

  it('all permission values are unique', () => {
    const values = Object.values(USER_PERMISSIONS);
    const uniqueValues = new Set(values);
    expect(values.length).toBe(uniqueValues.size);
  });
});
