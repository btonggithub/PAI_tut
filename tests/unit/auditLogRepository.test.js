const auditLogRepository = require('../../src/repositories/audit/auditLogRepository');
const AuditLog = require('../../src/models/auditLogModel');

jest.mock('../../src/models/auditLogModel');

describe('auditLogRepository', () => {
  beforeEach(() => {
    AuditLog.find = jest.fn();
    AuditLog.countDocuments = jest.fn();
  });

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

  describe('findAuditLogs', () => {
    const createFindChain = (items) => {
      const chain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(items),
      };

      AuditLog.find.mockReturnValue(chain);
      AuditLog.countDocuments.mockResolvedValue(items.length);

      return chain;
    };

    it('queries audit logs with filters, sort, and pagination', async () => {
      const items = [{ _id: 'audit-1', action: 'auth.login', result: 'succeeded' }];
      const chain = createFindChain(items);

      const result = await auditLogRepository.findAuditLogs({
        action: 'auth.login',
        result: 'succeeded',
        page: 2,
        limit: 5,
        sort: 'action,-createdAt',
      });

      expect(AuditLog.find).toHaveBeenCalledWith({
        action: 'auth.login',
        result: 'succeeded',
      });
      expect(chain.sort).toHaveBeenCalledWith('action -createdAt');
      expect(chain.skip).toHaveBeenCalledWith(5);
      expect(chain.limit).toHaveBeenCalledWith(5);
      expect(AuditLog.countDocuments).toHaveBeenCalledWith({
        action: 'auth.login',
        result: 'succeeded',
      });
      expect(result.items).toEqual(items);
      expect(result.meta).toEqual(expect.objectContaining({
        total: 1,
        page: 2,
        limit: 5,
      }));
    });

    it('builds createdAt range filters inside the repository', async () => {
      createFindChain([]);

      await auditLogRepository.findAuditLogs({
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-31T23:59:59.000Z',
      });

      expect(AuditLog.find).toHaveBeenCalledWith({
        createdAt: {
          $gte: new Date('2026-01-01T00:00:00.000Z'),
          $lte: new Date('2026-01-31T23:59:59.000Z'),
        },
      });
    });
  });
});
