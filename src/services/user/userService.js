const AppError = require('../../utils/AppError');
const userRepository = require('../../repositories/user/userRepository');

const getMe = async (userId) => {
  const user = await userRepository.findUserProfile(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

const updateMe = async (userId, payload) => {
  const allowedFields = ['name', 'email'];
  const updatePayload = {};

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      updatePayload[field] = payload[field];
    }
  });

  if (Object.keys(updatePayload).length === 0) {
    throw new AppError('No updatable fields provided', 400);
  }

  if (updatePayload.email) {
    const existingUser = await userRepository.findUserByEmailExcludingId(updatePayload.email, userId);

    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    updatePayload.email = updatePayload.email.toLowerCase();
  }

  const updatedUser = await userRepository.updateUserProfile(userId, updatePayload);

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  return updatedUser;
};

const listUsers = async (query = {}) => {
  const result = await userRepository.findUsers(query);

  return {
    users: result.items,
    meta: result.meta,
  };
};

const getUserById = async (userId) => {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

module.exports = {
  getMe,
  updateMe,
  listUsers,
  getUserById,
};
