const auditLogRepository = require('../../src/repositories/audit/auditLogRepository');
const AuditLog = require('../../src/models/auditLogModel');

jest.mock('../../src/models/auditLogModel');

describe('auditLogRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recordAuditLog', () => {
    it('calls AuditLog.create with payload', async () => {
      const payload = {
        action: 'auth.login',
        result: 'succeeded',
        actorId: 'user-123',
        actorRole: 'admin',
      };

      AuditLog.create.mockResolvedValue(payload);

      await auditLogRepository.recordAuditLog(payload);

      expect(AuditLog.create).toHaveBeenCalledWith(payload);
    });

    it('returns created audit log record', async () => {
      const payload = {
        action: 'auth.login',
        result: 'succeeded',
        actorId: 'user-123',
      };

      const expectedResult = {
        _id: 'audit-123',
        ...payload,
        createdAt: new Date(),
      };

      AuditLog.create.mockResolvedValue(expectedResult);

      const result = await auditLogRepository.recordAuditLog(payload);

      expect(result).toEqual(expectedResult);
    });

    it('handles repository errors', async () => {
      const payload = { action: 'test', result: 'succeeded' };
      const error = new Error('Database error');

      AuditLog.create.mockRejectedValue(error);

      await expect(auditLogRepository.recordAuditLog(payload)).rejects.toThrow(error);
    });

    it('creates audit log with minimal payload', async () => {
      const payload = {
        action: 'auth.logout',
        result: 'succeeded',
      };

      AuditLog.create.mockResolvedValue(payload);

      await auditLogRepository.recordAuditLog(payload);

      expect(AuditLog.create).toHaveBeenCalledWith(payload);
    });

    it('creates audit log with full payload', async () => {
      const payload = {
        action: 'user.profile.update',
        result: 'succeeded',
        actorId: 'user-123',
        actorRole: 'user',
        resourceType: 'user',
        resourceId: 'user-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        metadata: { fields: ['name', 'email'] },
      };

      AuditLog.create.mockResolvedValue(payload);

      await auditLogRepository.recordAuditLog(payload);

      expect(AuditLog.create).toHaveBeenCalledWith(payload);
    });
  });
});
