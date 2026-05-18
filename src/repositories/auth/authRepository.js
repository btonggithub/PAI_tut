const User = require('../../models/userModel');

const findUserByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() });
};

const findUserById = async (userId) => {
  return User.findById(userId);
};

const createUser = async (payload) => {
  return User.create(payload);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
};
