const User = require('../../models/userModel');
const BaseRepository = require('../base/BaseRepository');

const authBaseRepository = new BaseRepository(User);

const findUserByEmail = async (email) => {
  return authBaseRepository.findOne({ email: email.toLowerCase() });
};

const findUserById = async (userId) => {
  return authBaseRepository.findById(userId);
};

const createUser = async (payload) => {
  return authBaseRepository.create(payload);
};

const listUsers = async (query = {}) => {
  return authBaseRepository.findMany(query, {
    allowedFilters: ['name', 'email'],
    allowedSortFields: ['name', 'email', 'createdAt', 'updatedAt'],
    projection: '-password',
    defaultSort: '-createdAt',
    useLean: true,
  });
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  listUsers,
};
