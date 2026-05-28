const AppError = require('../../utils/AppError');
const userRepository = require('../../repositories/user/userRepository');
const { toSafeUser, toSafeUsers } = require('./userMapper');
const { canViewUser, canUpdateUser, canManageUsers } = require('../../policies/userPolicy');
const { recordAuditEvent } = require('../audit/auditLogService');
const AUDIT_ACTIONS = require('../audit/auditActions');
const AUDIT_RESULTS = require('../audit/auditResults');

const getMe = async (userId) => {
  const user = await userRepository.findUserProfile(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return toSafeUser(user);
};

const updateMe = async (userId, payload, actor) => {
  // Check if actor has permission to update this user
  if (!canUpdateUser(actor, userId)) {
    throw new AppError('Forbidden', 403);
  }

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

  // Record successful profile update audit event
  await recordAuditEvent({
    action: AUDIT_ACTIONS.USER_PROFILE_UPDATE,
    result: AUDIT_RESULTS.SUCCEEDED,
    actorId: actor.id,
    actorRole: actor.role,
    resourceType: 'user',
    resourceId: userId,
    metadata: { fields: Object.keys(updatePayload) },
  });

  return toSafeUser(updatedUser);
};

const listUsers = async (query = {}, actor) => {
  // Check if actor has permission to list users
  if (!canManageUsers(actor)) {
    throw new AppError('Forbidden', 403);
  }

  const result = await userRepository.findUsers(query);

  // Record audit event for admin user listing
  await recordAuditEvent({
    action: AUDIT_ACTIONS.USER_READ_ADMIN,
    result: AUDIT_RESULTS.SUCCEEDED,
    actorId: actor.id,
    actorRole: actor.role,
    resourceType: 'users',
    metadata: { count: result.items.length, page: query.page || 1 },
  });

  return {
    users: toSafeUsers(result.items),
    meta: result.meta,
  };
};

const getUserById = async (userId, actor) => {
  // Check if actor has permission to view this user
  if (!canViewUser(actor, userId)) {
    throw new AppError('Forbidden', 403);
  }

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Record audit event for admin user read
  if (actor.role === 'admin' && actor.id !== userId) {
    await recordAuditEvent({
      action: AUDIT_ACTIONS.USER_READ_ADMIN,
      result: AUDIT_RESULTS.SUCCEEDED,
      actorId: actor.id,
      actorRole: actor.role,
      resourceType: 'user',
      resourceId: userId,
    });
  }

  return toSafeUser(user);
};

module.exports = {
  getMe,
  updateMe,
  listUsers,
  getUserById,
};
