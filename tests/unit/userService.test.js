jest.mock('../../src/repositories/user/userRepository', () => ({
  findUserProfile: jest.fn(),
  findUserById: jest.fn(),
  findUserByEmailExcludingId: jest.fn(),
  updateUserProfile: jest.fn(),
  findUsers: jest.fn(),
}));

jest.mock('../../src/services/audit/auditLogService', () => ({
  recordAuditEvent: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/services/cache/cacheService', () => ({
  withCache: jest.fn((key, fetcher, ttl) => fetcher()),
  buildCacheKey: jest.fn((baseKey, params) => {
    if (!params || Object.keys(params).length === 0) return baseKey;
    const paramStr = Object.keys(params)
      .sort()
      .map((k) => `${k}=${JSON.stringify(params[k])}`)
      .join(':');
    return `${baseKey}:${paramStr}`;
  }),
  invalidateUserCache: jest.fn(),
}));

const AppError = require('../../src/utils/AppError');
const userService = require('../../src/services/user/userService');
const userRepository = require('../../src/repositories/user/userRepository');
const { recordAuditEvent } = require('../../src/services/audit/auditLogService');
const cacheService = require('../../src/services/cache/cacheService');
const AUDIT_ACTIONS = require('../../src/services/audit/auditActions');
const AUDIT_RESULTS = require('../../src/services/audit/auditResults');

const userActor = {
  id: 'u1',
  role: 'user',
};

const adminActor = {
  id: 'admin-id',
  role: 'admin',
};

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getMe returns user profile when found', async () => {
    const user = {
      _id: '64b7f5b9f1d2c3a4b5c6d7e8',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      password: 'hidden',
      __v: 0,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };
    userRepository.findUserProfile.mockResolvedValue(user);

    const result = await userService.getMe(user._id);

    expect(userRepository.findUserProfile).toHaveBeenCalledWith(user._id);
    expect(result).toEqual({
      id: user._id,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });
  });

  it('updateMe throws AppError when no updatable fields are provided', async () => {
    await expect(userService.updateMe('u1', {}, userActor)).rejects.toMatchObject({
      message: 'No updatable fields provided',
      statusCode: 400,
    });
  });

  it('updateMe updates and normalizes email', async () => {
    const updated = {
      _id: '64b7f5b9f1d2c3a4b5c6d7e8',
      name: 'Next Name',
      email: 'next@example.com',
      role: 'user',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    };
    userRepository.findUserByEmailExcludingId.mockResolvedValue(null);
    userRepository.updateUserProfile.mockResolvedValue(updated);

    const result = await userService.updateMe(
      updated._id,
      {
        email: 'NEXT@EXAMPLE.COM',
        name: 'Next Name',
        ignored: 'field',
      },
      adminActor,
      { ipAddress: '127.0.0.1', userAgent: 'Jest' }
    );

    expect(userRepository.findUserByEmailExcludingId).toHaveBeenCalledWith('NEXT@EXAMPLE.COM', updated._id);
    expect(userRepository.updateUserProfile).toHaveBeenCalledWith(updated._id, {
      email: 'next@example.com',
      name: 'Next Name',
    });
    expect(result).toEqual({
      id: updated._id,
      name: 'Next Name',
      email: 'next@example.com',
      role: 'user',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    });
    expect(recordAuditEvent).toHaveBeenCalledWith({
      action: AUDIT_ACTIONS.USER_PROFILE_UPDATE,
      result: AUDIT_RESULTS.SUCCEEDED,
      actorId: adminActor.id,
      actorRole: adminActor.role,
      resourceType: 'user',
      resourceId: updated._id,
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
      metadata: { fields: ['name', 'email'] },
    });
  });

  it('listUsers returns users and pagination metadata', async () => {
    const query = { page: 2, limit: 5, name: 'john' };
    const repoResult = {
      items: [
        {
          _id: '64b7f5b9f1d2c3a4b5c6d7e8',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          password: 'hidden',
          __v: 0,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        },
      ],
      meta: {
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: true,
      },
    };
    userRepository.findUsers.mockResolvedValue(repoResult);

    const result = await userService.listUsers(query, adminActor, {
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    });

    expect(userRepository.findUsers).toHaveBeenCalledWith(query);
    expect(result).toEqual({
      users: [
        {
          id: '64b7f5b9f1d2c3a4b5c6d7e8',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        },
      ],
      meta: repoResult.meta,
    });
    expect(recordAuditEvent).toHaveBeenCalledWith({
      action: AUDIT_ACTIONS.USER_READ_ADMIN,
      result: AUDIT_RESULTS.SUCCEEDED,
      actorId: adminActor.id,
      actorRole: adminActor.role,
      resourceType: 'users',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
      metadata: { count: 1, page: 2 },
    });
  });

  it('getUserById returns normalized user DTO', async () => {
    userRepository.findUserById.mockResolvedValue({
      _id: '64b7f5b9f1d2c3a4b5c6d7e8',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      password: 'hidden',
      __v: 0,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    const result = await userService.getUserById('64b7f5b9f1d2c3a4b5c6d7e8', adminActor, {
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    });

    expect(result).toEqual({
      id: '64b7f5b9f1d2c3a4b5c6d7e8',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });
    expect(recordAuditEvent).toHaveBeenCalledWith({
      action: AUDIT_ACTIONS.USER_READ_ADMIN,
      result: AUDIT_RESULTS.SUCCEEDED,
      actorId: adminActor.id,
      actorRole: adminActor.role,
      resourceType: 'user',
      resourceId: '64b7f5b9f1d2c3a4b5c6d7e8',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    });
  });

  it('getUserById throws AppError when missing', async () => {
    userRepository.findUserById.mockResolvedValue(null);

    await expect(userService.getUserById('missing-id', adminActor)).rejects.toBeInstanceOf(AppError);
    await expect(userService.getUserById('missing-id', adminActor)).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    });
  });

  describe('Authorization Policy Integration', () => {
    it('listUsers throws Forbidden when non-admin user tries to list users', async () => {
      await expect(userService.listUsers({}, userActor)).rejects.toMatchObject({
        message: 'Forbidden',
        statusCode: 403,
      });
    });

    it('listUsers succeeds when admin lists users', async () => {
      const repoResult = {
        items: [
          {
            _id: '64b7f5b9f1d2c3a4b5c6d7e8',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-02T00:00:00.000Z'),
          },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      userRepository.findUsers.mockResolvedValue(repoResult);

      const result = await userService.listUsers({}, adminActor);

      expect(result.users).toHaveLength(1);
      expect(result.meta).toEqual(repoResult.meta);
    });

    it('getUserById throws Forbidden when user tries to view another user', async () => {
      await expect(userService.getUserById('user-456', userActor)).rejects.toMatchObject({
        message: 'Forbidden',
        statusCode: 403,
      });
    });

    it('getUserById succeeds when user views own profile', async () => {
      userRepository.findUserById.mockResolvedValue({
        _id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      const result = await userService.getUserById('u1', userActor);

      expect(result.id).toBe('u1');
    });

    it('getUserById succeeds when admin views any user', async () => {
      userRepository.findUserById.mockResolvedValue({
        _id: 'user-456',
        name: 'Another User',
        email: 'another@example.com',
        role: 'user',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      const result = await userService.getUserById('user-456', adminActor);

      expect(result.id).toBe('user-456');
    });

    it('updateMe throws Forbidden when user tries to update another user', async () => {
      await expect(userService.updateMe('user-456', { name: 'New Name' }, userActor)).rejects.toMatchObject({
        message: 'Forbidden',
        statusCode: 403,
      });
    });

    it('updateMe succeeds when user updates own profile with policy check', async () => {
      const updated = {
        _id: 'u1',
        name: 'Updated Name',
        email: 'user@example.com',
        role: 'user',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      };
      userRepository.findUserByEmailExcludingId.mockResolvedValue(null);
      userRepository.updateUserProfile.mockResolvedValue(updated);

      const result = await userService.updateMe('u1', { name: 'Updated Name' }, userActor);

      expect(result.id).toBe('u1');
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('Cache Integration', () => {
    it('getMe uses cache service with correct cache key', async () => {
      const user = {
        _id: '64b7f5b9f1d2c3a4b5c6d7e8',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      };
      userRepository.findUserProfile.mockResolvedValue(user);

      await userService.getMe('64b7f5b9f1d2c3a4b5c6d7e8');

      expect(cacheService.withCache).toHaveBeenCalledWith(
        expect.stringContaining('user:profile'),
        expect.any(Function),
        3600
      );
    });

    it('listUsers uses cache service with correct cache key', async () => {
      const query = { page: 1, limit: 10 };
      const repoResult = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      userRepository.findUsers.mockResolvedValue(repoResult);

      await userService.listUsers(query, adminActor);

      expect(cacheService.withCache).toHaveBeenCalledWith(
        expect.stringContaining('users:list'),
        expect.any(Function),
        1800
      );
    });

    it('getUserById uses cache service with correct cache key', async () => {
      userRepository.findUserById.mockResolvedValue({
        _id: '64b7f5b9f1d2c3a4b5c6d7e8',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      await userService.getUserById('64b7f5b9f1d2c3a4b5c6d7e8', adminActor);

      expect(cacheService.withCache).toHaveBeenCalledWith(
        expect.stringContaining('user:id'),
        expect.any(Function),
        3600
      );
    });

    it('updateMe invalidates user cache after update', async () => {
      const updated = {
        _id: 'u1',
        name: 'Updated Name',
        email: 'user@example.com',
        role: 'user',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      };
      userRepository.findUserByEmailExcludingId.mockResolvedValue(null);
      userRepository.updateUserProfile.mockResolvedValue(updated);

      await userService.updateMe('u1', { name: 'Updated Name' }, userActor);

      expect(cacheService.invalidateUserCache).toHaveBeenCalledWith('u1');
    });
  });
});
