const AppError = require('../../utils/AppError');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signToken } = require('../../utils/jwt');
const authRepository = require('../../repositories/auth/authRepository');
const { toSafeUser } = require('../user/userMapper');

const register = async ({ name, email, password }) => {
  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  const hashedPassword = await hashPassword(password);
  const user = await authRepository.createUser({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const token = signToken({ sub: user.id });

  return {
    user: toSafeUser(user),
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({ sub: user.id });

  return {
    user: toSafeUser(user),
    token,
  };
};

const getAuthUser = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return toSafeUser(user);
};

module.exports = {
  register,
  login,
  getAuthUser,
};
