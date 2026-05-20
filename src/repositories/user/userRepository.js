const User = require('../../models/userModel');
const BaseRepository = require('../base/BaseRepository');

const userBaseRepository = new BaseRepository(User);

const findUserProfile = async (userId) => {
  return User.findById(userId, '-password').lean();
};

const findUserById = async (userId) => {
  return User.findById(userId, '-password').lean();
};

const findUserByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() });
};

const findUserByEmailExcludingId = async (email, userId) => {
  return User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
};

const updateUserProfile = async (userId, payload) => {
  return User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
    projection: '-password',
  }).lean();
};

const findUsers = async (query = {}) => {
  return userBaseRepository.findMany(query, {
    allowedFilters: ['name', 'email'],
    allowedSortFields: ['name', 'email', 'createdAt', 'updatedAt'],
    projection: '-password',
    defaultSort: '-createdAt',
    useLean: true,
  });
};

module.exports = {
  findUserProfile,
  findUserById,
  findUserByEmail,
  findUserByEmailExcludingId,
  updateUserProfile,
  findUsers,
};
