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

jest.mock('../../src/services/audit/auditLogService', () => ({
  recordAuditEvent: jest.fn().mockResolvedValue({}),
}));

const app = require('../../src/app');
const { toAuthHeader } = require('../helpers/authHeader');
const { signAccessToken } = require('../../src/utils/jwt');
const authService = require('../../src/services/auth/authService');
const userRepository = require('../../src/repositories/user/userRepository');

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
};

const accessHeaderFor = (userId) => toAuthHeader(signAccessToken({ sub: userId }));

describe('User API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  it('GET /api/v1/users/me requires authentication', async () => {
    const response = await request(app).get('/api/v1/users/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 401 });
  });

  it('GET /api/v1/users requires authentication', async () => {
    const response = await request(app).get('/api/v1/users');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 401 });
  });

  it('GET /api/v1/users/:id requires authentication', async () => {
    const response = await request(app).get('/api/v1/users/64b7f5b9f1d2c3a4b5c6d7e8');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 401 });
  });

  it('GET /api/v1/users rejects invalid authentication token', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .set(toAuthHeader());

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 401 });
  });

  it('GET /api/v1/users blocks authenticated users without user.read permission', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .set(accessHeaderFor(regularUser.id));

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 403 });
    expect(userRepository.findUsers).not.toHaveBeenCalled();
  });

  it('GET /api/v1/users allows admins with user.read permission', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .set(accessHeaderFor(adminUser.id));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.users).toHaveLength(1);
    expect(userRepository.findUsers).toHaveBeenCalledWith({});
  });

  it('GET /api/v1/users/:id blocks authenticated users without user.read permission', async () => {
    const response = await request(app)
      .get(`/api/v1/users/${targetUser.id}`)
      .set(accessHeaderFor(regularUser.id));

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 403 });
    expect(userRepository.findUserById).not.toHaveBeenCalled();
  });

  it('GET /api/v1/users/:id allows admins with user.read permission', async () => {
    const response = await request(app)
      .get(`/api/v1/users/${targetUser.id}`)
      .set(accessHeaderFor(adminUser.id));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toEqual(expect.objectContaining({
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
    }));
    expect(userRepository.findUserById).toHaveBeenCalledWith(targetUser.id);
  });
});
