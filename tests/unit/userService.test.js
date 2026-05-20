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
const { makeUserFixture } = require('../fixtures/userFixture');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getMe returns user profile when found', async () => {
    const user = makeUserFixture();
    userRepository.findUserProfile.mockResolvedValue(user);

    const result = await userService.getMe(user.id);

    expect(userRepository.findUserProfile).toHaveBeenCalledWith(user.id);
    expect(result).toEqual(user);
  });

  it('updateMe throws AppError when no updatable fields are provided', async () => {
    await expect(userService.updateMe('u1', {})).rejects.toMatchObject({
      message: 'No updatable fields provided',
      statusCode: 400,
    });
  });

  it('updateMe updates and normalizes email', async () => {
    const updated = makeUserFixture({ email: 'next@example.com' });
    userRepository.findUserByEmailExcludingId.mockResolvedValue(null);
    userRepository.updateUserProfile.mockResolvedValue(updated);

    const result = await userService.updateMe(updated.id, {
      email: 'NEXT@EXAMPLE.COM',
      name: 'Next Name',
      ignored: 'field',
    });

    expect(userRepository.findUserByEmailExcludingId).toHaveBeenCalledWith('NEXT@EXAMPLE.COM', updated.id);
    expect(userRepository.updateUserProfile).toHaveBeenCalledWith(updated.id, {
      email: 'next@example.com',
      name: 'Next Name',
    });
    expect(result).toEqual(updated);
  });

  it('listUsers returns users and pagination metadata', async () => {
    const query = { page: 2, limit: 5, name: 'john' };
    const repoResult = {
      items: [makeUserFixture()],
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
      users: repoResult.items,
      meta: repoResult.meta,
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
