const request = require('supertest');

jest.mock('../../src/services/auth/authService', () => ({
  getAuthUser: jest.fn(),
}));

jest.mock('../../src/repositories/user/userRepository', () => ({
  findUserProfile: jest.fn(),
  findUserById: jest.fn(),
  findUsers: jest.fn(),
  findUserByEmailExcludingId: jest.fn(),
  updateUserProfile: jest.fn(),
}));

jest.mock('../../src/repositories/file/fileRepository', () => ({
  createFileMetadata: jest.fn(),
  findFileById: jest.fn(),
  findFilesByOwner: jest.fn(),
  findFiles: jest.fn(),
  updateFileStatus: jest.fn(),
}));

jest.mock('../../src/repositories/system/systemRepository', () => ({
  fetchSystemInfo: jest.fn(),
}));

jest.mock('../../src/services/audit/auditLogService', () => ({
  recordAuditEvent: jest.fn().mockResolvedValue({}),
}));

const app = require('../../src/app');
const { toAuthHeader } = require('../helpers/authHeader');
const { signAccessToken } = require('../../src/utils/jwt');
const authService = require('../../src/services/auth/authService');
const userRepository = require('../../src/repositories/user/userRepository');
const fileRepository = require('../../src/repositories/file/fileRepository');
const systemRepository = require('../../src/repositories/system/systemRepository');
const cacheStore = require('../../src/utils/cache');

const adminUser = {
  id: '64b7f5b9f1d2c3a4b5c6d7a1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

const regularUser = {
  id: '64b7f5b9f1d2c3a4b5c6d7b2',
  name: 'Regular User',
  email: 'user@example.com',
  role: 'user',
};

const targetUser = {
  id: '64b7f5b9f1d2c3a4b5c6d7e8',
  name: 'Target User',
  email: 'target@example.com',
  role: 'user',
  password: 'hashed-password',
  refreshToken: 'refresh-token',
};

const targetFile = {
  _id: '64b7f5b9f1d2c3a4b5c6d7f1',
  ownerId: targetUser.id,
  originalName: 'admin-file.txt',
  storedName: 'internal-name.txt',
  mimeType: 'text/plain',
  size: 512,
  extension: 'txt',
  storageKey: 'private/storage/key.txt',
  storageProvider: 'local',
  status: 'active',
  metadata: {},
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const otherOwnerFile = {
  _id: '64b7f5b9f1d2c3a4b5c6d7f2',
  ownerId: regularUser.id,
  originalName: 'other-owner-file.txt',
  storedName: 'other-internal-name.txt',
  mimeType: 'text/plain',
  size: 1024,
  extension: 'txt',
  storageKey: 'private/storage/other-owner-file.txt',
  storageProvider: 'local',
  status: 'active',
  metadata: {},
  createdAt: new Date('2026-01-02T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

const accessHeaderFor = (userId) => toAuthHeader(signAccessToken({ sub: userId }));

describe('Admin API integration', () => {
  const adminEndpoints = [
    ['GET /api/v1/admin/users', '/api/v1/admin/users'],
    ['GET /api/v1/admin/users/:id', `/api/v1/admin/users/${targetUser.id}`],
    ['GET /api/v1/admin/files', '/api/v1/admin/files'],
    ['GET /api/v1/admin/files/:id', `/api/v1/admin/files/${targetFile._id}`],
    ['GET /api/v1/admin/system', '/api/v1/admin/system'],
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    cacheStore.clear();

    authService.getAuthUser.mockImplementation(async (userId) => {
      if (userId === adminUser.id) {
        return adminUser;
      }

      return regularUser;
    });

    userRepository.findUsers.mockResolvedValue({
      items: [targetUser],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    userRepository.findUserById.mockResolvedValue(targetUser);

    fileRepository.findFiles.mockResolvedValue({
      items: [targetFile, otherOwnerFile],
      meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
    fileRepository.findFileById.mockResolvedValue(targetFile);

    systemRepository.fetchSystemInfo.mockResolvedValue({
      service: 'PAI_tut Backend',
      version: 'v1',
      uptime: 42,
    });
  });

  it.each(adminEndpoints)('%s requires authentication', async (_label, endpoint) => {
    const response = await request(app).get(endpoint);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it.each(adminEndpoints)('%s forbids non-admin users', async (_label, endpoint) => {
    const response = await request(app)
      .get(endpoint)
      .set(accessHeaderFor(regularUser.id));

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/v1/admin/users allows admins', async () => {
    const response = await request(app)
      .get('/api/v1/admin/users')
      .set(accessHeaderFor(adminUser.id));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('users');
    expect(response.body.data).toHaveProperty('meta');
    expect(response.body.data.users[0]).not.toHaveProperty('password');
    expect(response.body.data.users[0]).not.toHaveProperty('refreshToken');
  });

  it('GET /api/v1/admin/users/:id allows admins', async () => {
    const response = await request(app)
      .get(`/api/v1/admin/users/${targetUser.id}`)
      .set(accessHeaderFor(adminUser.id));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toEqual(expect.objectContaining({
      id: targetUser.id,
      email: targetUser.email,
    }));
  });

  it('GET /api/v1/admin/files allows admins', async () => {
    const response = await request(app)
      .get('/api/v1/admin/files')
      .set(accessHeaderFor(adminUser.id));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('files');
    expect(response.body.data).toHaveProperty('meta');
    expect(response.body.data.files).toHaveLength(2);
    expect(response.body.data.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: targetFile._id, ownerId: targetUser.id }),
      expect.objectContaining({ id: otherOwnerFile._id, ownerId: regularUser.id }),
    ]));
    expect(fileRepository.findFiles).toHaveBeenCalledWith({});
    expect(fileRepository.findFilesByOwner).not.toHaveBeenCalled();
    response.body.data.files.forEach((file) => {
      expect(file).not.toHaveProperty('storageKey');
      expect(file).not.toHaveProperty('storedName');
    });
  });

  it('GET /api/v1/admin/files/:id allows admins', async () => {
    const response = await request(app)
      .get(`/api/v1/admin/files/${targetFile._id}`)
      .set(accessHeaderFor(adminUser.id));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.file).toEqual(expect.objectContaining({
      id: targetFile._id,
      ownerId: targetUser.id,
    }));
    expect(response.body.data.file).not.toHaveProperty('storageKey');
    expect(response.body.data.file).not.toHaveProperty('storedName');
  });

  it('GET /api/v1/admin/system allows admins', async () => {
    const response = await request(app)
      .get('/api/v1/admin/system')
      .query({ scope: 'basic' })
      .set(accessHeaderFor(adminUser.id));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({
      service: 'PAI_tut Backend',
      version: 'v1',
    }));
    expect(response.body.data).not.toHaveProperty('env');
    expect(response.body.data).not.toHaveProperty('environment');
    expect(response.body.data).not.toHaveProperty('secrets');
    expect(response.body.data).not.toHaveProperty('config');
  });
});
