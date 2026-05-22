jest.mock('../../src/repositories/auth/authRepository', () => ({
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock('../../src/utils/password', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../../src/utils/jwt', () => ({
  signToken: jest.fn(),
}));

const AppError = require('../../src/utils/AppError');
const authService = require('../../src/services/auth/authService');
const authRepository = require('../../src/repositories/auth/authRepository');
const { hashPassword, comparePassword } = require('../../src/utils/password');
const { signToken } = require('../../src/utils/jwt');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('registers user and returns safe user plus token', async () => {
      authRepository.findUserByEmail.mockResolvedValue(null);
      hashPassword.mockResolvedValue('hashed-password');
      authRepository.createUser.mockResolvedValue({
        id: 'u1',
        name: 'John',
        email: 'john@example.com',
        role: 'user',
        password: 'hashed-password',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
      signToken.mockReturnValue('jwt-token');

      const result = await authService.register({
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('john@example.com');
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(authRepository.createUser).toHaveBeenCalledWith({
        name: 'John',
        email: 'john@example.com',
        password: 'hashed-password',
      });
      expect(signToken).toHaveBeenCalledWith({ sub: 'u1' });
      expect(result).toEqual({
        user: {
          id: 'u1',
          name: 'John',
          email: 'john@example.com',
          role: 'user',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
        token: 'jwt-token',
      });
    });

    it('throws AppError when email already exists', async () => {
      authRepository.findUserByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.register({
          name: 'John',
          email: 'john@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        message: 'Email already in use',
        statusCode: 409,
        isOperational: true,
      });
    });
  });

  describe('login', () => {
    it('returns safe user and token on valid credentials', async () => {
      authRepository.findUserByEmail.mockResolvedValue({
        id: 'u1',
        name: 'John',
        email: 'john@example.com',
        role: 'user',
        password: 'hashed-password',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
      comparePassword.mockResolvedValue(true);
      signToken.mockReturnValue('jwt-token');

      const result = await authService.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(comparePassword).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).toEqual({
        user: {
          id: 'u1',
          name: 'John',
          email: 'john@example.com',
          role: 'user',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
        token: 'jwt-token',
      });
    });

    it('throws AppError on invalid credentials', async () => {
      authRepository.findUserByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'john@example.com', password: 'wrongpass' })
      ).rejects.toBeInstanceOf(AppError);

      await expect(
        authService.login({ email: 'john@example.com', password: 'wrongpass' })
      ).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      });
    });
  });
});
