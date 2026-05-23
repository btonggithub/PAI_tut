jest.mock('../../src/repositories/user/userRepository', () => ({
  findUserProfile: jest.fn(),
  findUserById: jest.fn(),
  findUserByEmailExcludingId: jest.fn(),
  updateUserProfile: jest.fn(),
  findUsers: jest.fn(),
}));

const AppError = require('../../src/utils/AppError');
const userService = require('../../src/services/user/userService');
const userRepository = require('../../src/repositories/user/userRepository');

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
    await expect(userService.updateMe('u1', {})).rejects.toMatchObject({
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

    const result = await userService.updateMe(updated._id, {
      email: 'NEXT@EXAMPLE.COM',
      name: 'Next Name',
      ignored: 'field',
    });

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

    const result = await userService.listUsers(query);

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

    const result = await userService.getUserById('64b7f5b9f1d2c3a4b5c6d7e8');

    expect(result).toEqual({
      id: '64b7f5b9f1d2c3a4b5c6d7e8',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });
  });

  it('getUserById throws AppError when missing', async () => {
    userRepository.findUserById.mockResolvedValue(null);

    await expect(userService.getUserById('missing-id')).rejects.toBeInstanceOf(AppError);
    await expect(userService.getUserById('missing-id')).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    });
  });
});
