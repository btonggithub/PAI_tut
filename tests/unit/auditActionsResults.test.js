const AUDIT_ACTIONS = require('../../src/services/audit/auditActions');
const AUDIT_RESULTS = require('../../src/services/audit/auditResults');

describe('AUDIT_ACTIONS constants', () => {
  it('defines AUTH_LOGIN action', () => {
    expect(AUDIT_ACTIONS.AUTH_LOGIN).toBe('auth.login');
  });

  it('defines AUTH_REFRESH action', () => {
    expect(AUDIT_ACTIONS.AUTH_REFRESH).toBe('auth.refresh');
  });

  it('defines AUTH_LOGOUT action', () => {
    expect(AUDIT_ACTIONS.AUTH_LOGOUT).toBe('auth.logout');
  });

  it('defines USER_PROFILE_UPDATE action', () => {
    expect(AUDIT_ACTIONS.USER_PROFILE_UPDATE).toBe('user.profile.update');
  });

  it('defines USER_READ_ADMIN action', () => {
    expect(AUDIT_ACTIONS.USER_READ_ADMIN).toBe('user.read.admin');
  });

  it('defines FILE_UPLOAD action', () => {
    expect(AUDIT_ACTIONS.FILE_UPLOAD).toBe('file.upload');
  });

  it('defines FILE_LIST action', () => {
    expect(AUDIT_ACTIONS.FILE_LIST).toBe('file.list');
  });

  it('defines FILE_VIEW action', () => {
    expect(AUDIT_ACTIONS.FILE_VIEW).toBe('file.view');
  });

  it('action names are lowercase and dot-separated', () => {
    Object.values(AUDIT_ACTIONS).forEach((action) => {
      expect(action).toMatch(/^[a-z.]+$/);
      expect(action.toLowerCase()).toBe(action);
    });
  });

  it('action names are unique', () => {
    const values = Object.values(AUDIT_ACTIONS);
    const uniqueValues = new Set(values);
    expect(values.length).toBe(uniqueValues.size);
  });
});

describe('AUDIT_RESULTS constants', () => {
  it('defines SUCCEEDED result', () => {
    expect(AUDIT_RESULTS.SUCCEEDED).toBe('succeeded');
  });

  it('defines FAILED result', () => {
    expect(AUDIT_RESULTS.FAILED).toBe('failed');
  });

  it('defines FORBIDDEN result', () => {
    expect(AUDIT_RESULTS.FORBIDDEN).toBe('forbidden');
  });

  it('result values are lowercase', () => {
    Object.values(AUDIT_RESULTS).forEach((result) => {
      expect(result).toBe(result.toLowerCase());
    });
  });

  it('result values are unique', () => {
    const values = Object.values(AUDIT_RESULTS);
    const uniqueValues = new Set(values);
    expect(values.length).toBe(uniqueValues.size);
  });
});
