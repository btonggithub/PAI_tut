const { recordAuditEvent, sanitizeMetadata } = require('../../src/services/audit/auditLogService');
const auditLogRepository = require('../../src/repositories/audit/auditLogRepository');
const AUDIT_RESULTS = require('../../src/services/audit/auditResults');

jest.mock('../../src/repositories/audit/auditLogRepository');

describe('auditLogService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeMetadata', () => {
    it('returns empty object for null metadata', () => {
      expect(sanitizeMetadata(null)).toEqual({});
    });

    it('returns empty object for undefined metadata', () => {
      expect(sanitizeMetadata(undefined)).toEqual({});
    });

    it('returns empty object for non-object metadata', () => {
      expect(sanitizeMetadata('not-object')).toEqual({});
    });

    it('removes password field', () => {
      const metadata = {
        password: 'secret123',
        name: 'John',
      };

      expect(sanitizeMetadata(metadata)).toEqual({ name: 'John' });
    });

    it('removes token field (case-insensitive)', () => {
      const metadata = {
        TOKEN: 'abc123',
        token: 'xyz',
        refreshToken: 'refresh123',
        name: 'John',
      };

      const result = sanitizeMetadata(metadata);
      expect(result).toEqual({ name: 'John' });
      expect(result.token).toBeUndefined();
      expect(result.TOKEN).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
    });

    it('removes authorization header', () => {
      const metadata = {
        authorization: 'Bearer xyz',
        Authorization: 'Bearer abc',
        name: 'John',
      };

      const result = sanitizeMetadata(metadata);
      expect(result).toEqual({ name: 'John' });
      expect(result.authorization).toBeUndefined();
      expect(result.Authorization).toBeUndefined();
    });

    it('removes accessToken and refreshToken', () => {
      const metadata = {
        accessToken: 'access123',
        refreshToken: 'refresh456',
        email: 'user@example.com',
      };

      const result = sanitizeMetadata(metadata);
      expect(result).toEqual({ email: 'user@example.com' });
    });

    it('preserves safe metadata fields', () => {
      const metadata = {
        reason: 'invalid_password',
        email: 'user@example.com',
        fields: ['name', 'email'],
        count: 5,
      };

      expect(sanitizeMetadata(metadata)).toEqual(metadata);
    });

    it('creates new object without mutating original', () => {
      const metadata = {
        password: 'secret',
        name: 'John',
      };

      const sanitized = sanitizeMetadata(metadata);

      expect(metadata.password).toBe('secret');
      expect(sanitized.password).toBeUndefined();
    });

    it('handles bearer tokens in metadata', () => {
      const metadata = {
        bearer: 'token123',
        data: 'safe',
      };

      const result = sanitizeMetadata(metadata);
      expect(result).toEqual({ data: 'safe' });
      expect(result.bearer).toBeUndefined();
    });
  });

  describe('recordAuditEvent', () => {
    it('calls repository with normalized payload', async () => {
      const payload = {
        action: 'auth.login',
        result: AUDIT_RESULTS.SUCCEEDED,
        actorId: 'user-123',
        actorRole: 'admin',
      };

      auditLogRepository.recordAuditLog.mockResolvedValue(payload);

      await recordAuditEvent(payload);

      expect(auditLogRepository.recordAuditLog).toHaveBeenCalled();
    });

    it('defaults result to SUCCEEDED', async () => {
      const payload = {
        action: 'auth.logout',
      };

      auditLogRepository.recordAuditLog.mockResolvedValue({
        ...payload,
        result: AUDIT_RESULTS.SUCCEEDED,
      });

      await recordAuditEvent(payload);

      const call = auditLogRepository.recordAuditLog.mock.calls[0][0];
      expect(call.result).toBe(AUDIT_RESULTS.SUCCEEDED);
    });

    it('sanitizes metadata', async () => {
      const payload = {
        action: 'auth.login',
        result: AUDIT_RESULTS.SUCCEEDED,
        metadata: {
          password: 'secret',
          reason: 'test',
        },
      };

      auditLogRepository.recordAuditLog.mockResolvedValue(payload);

      await recordAuditEvent(payload);

      const call = auditLogRepository.recordAuditLog.mock.calls[0][0];
      expect(call.metadata.password).toBeUndefined();
      expect(call.metadata.reason).toBe('test');
    });

    it('defaults optional fields to null', async () => {
      const payload = {
        action: 'auth.login',
        result: AUDIT_RESULTS.SUCCEEDED,
      };

      auditLogRepository.recordAuditLog.mockResolvedValue(payload);

      await recordAuditEvent(payload);

      const call = auditLogRepository.recordAuditLog.mock.calls[0][0];
      expect(call.actorId).toBeNull();
      expect(call.actorRole).toBeNull();
      expect(call.resourceType).toBeNull();
      expect(call.resourceId).toBeNull();
      expect(call.ipAddress).toBeNull();
      expect(call.userAgent).toBeNull();
    });

    it('handles empty metadata gracefully', async () => {
      const payload = {
        action: 'auth.logout',
        result: AUDIT_RESULTS.SUCCEEDED,
        metadata: {},
      };

      auditLogRepository.recordAuditLog.mockResolvedValue(payload);

      await recordAuditEvent(payload);

      const call = auditLogRepository.recordAuditLog.mock.calls[0][0];
      expect(call.metadata).toEqual({});
    });

    it('does not trust actor permissions from metadata', async () => {
      const payload = {
        action: 'auth.login',
        result: AUDIT_RESULTS.SUCCEEDED,
        metadata: {
          permissions: ['admin', 'user.manage'],
        },
      };

      auditLogRepository.recordAuditLog.mockResolvedValue(payload);

      await recordAuditEvent(payload);

      const call = auditLogRepository.recordAuditLog.mock.calls[0][0];
      // Metadata is preserved as-is (not a sensitive key)
      expect(call.metadata.permissions).toBeDefined();
    });

    it('returns created audit log', async () => {
      const expectedAuditLog = {
        _id: 'audit-123',
        action: 'auth.login',
        result: AUDIT_RESULTS.SUCCEEDED,
        createdAt: new Date(),
      };

      auditLogRepository.recordAuditLog.mockResolvedValue(expectedAuditLog);

      const result = await recordAuditEvent({
        action: 'auth.login',
        result: AUDIT_RESULTS.SUCCEEDED,
      });

      expect(result).toEqual(expectedAuditLog);
    });

    it('returns null when audit persistence fails', async () => {
      auditLogRepository.recordAuditLog.mockRejectedValue(new Error('database unavailable'));

      const result = await recordAuditEvent({
        action: 'auth.login',
        result: AUDIT_RESULTS.SUCCEEDED,
      });

      expect(result).toBeNull();
    });

    it('normalizes all payload fields', async () => {
      const payload = {
        action: 'user.profile.update',
        result: AUDIT_RESULTS.SUCCEEDED,
        actorId: 'user-123',
        actorRole: 'user',
        resourceType: 'user',
        resourceId: 'user-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        metadata: { fields: ['name'] },
      };

      auditLogRepository.recordAuditLog.mockResolvedValue(payload);

      await recordAuditEvent(payload);

      const call = auditLogRepository.recordAuditLog.mock.calls[0][0];
      expect(call).toEqual({
        action: 'user.profile.update',
        result: AUDIT_RESULTS.SUCCEEDED,
        actorId: 'user-123',
        actorRole: 'user',
        resourceType: 'user',
        resourceId: 'user-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        metadata: { fields: ['name'] },
      });
    });
  });
});
