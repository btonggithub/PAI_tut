const AppError = require('../../utils/AppError');
const userRepository = require('../../repositories/user/userRepository');
const { toSafeUser, toSafeUsers } = require('./userMapper');
const { canViewUser, canUpdateUser, canManageUsers } = require('../../policies/userPolicy');
const { recordAuditEvent } = require('../audit/auditLogService');
const AUDIT_ACTIONS = require('../audit/auditActions');
const AUDIT_RESULTS = require('../audit/auditResults');
const cacheService = require('../cache/cacheService');

const getMe = async (userId) => {
  const cacheKey = cacheService.buildCacheKey('user:profile', { userId });

  return cacheService.withCache(cacheKey, async () => {
    const user = await userRepository.findUserProfile(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return toSafeUser(user);
  }, 3600); // Cache for 1 hour
};

const updateMe = async (userId, payload, actor, requestContext = {}) => {
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

  // Invalidate caches after update
  cacheService.invalidateUserCache(userId);

  // Record successful profile update audit event
  await recordAuditEvent({
    action: AUDIT_ACTIONS.USER_PROFILE_UPDATE,
    result: AUDIT_RESULTS.SUCCEEDED,
    actorId: actor.id,
    actorRole: actor.role,
    resourceType: 'user',
    resourceId: userId,
    ipAddress: requestContext.ipAddress || null,
    userAgent: requestContext.userAgent || null,
    metadata: { fields: Object.keys(updatePayload) },
  });

  return toSafeUser(updatedUser);
};

const listUsers = async (query = {}, actor, requestContext = {}) => {
  // Check if actor has permission to list users
  if (!canManageUsers(actor)) {
    throw new AppError('Forbidden', 403);
  }

  const cacheKey = cacheService.buildCacheKey('users:list', query);

  return cacheService.withCache(cacheKey, async () => {
    const result = await userRepository.findUsers(query);

    // Record audit event for admin user listing
    await recordAuditEvent({
      action: AUDIT_ACTIONS.USER_READ_ADMIN,
      result: AUDIT_RESULTS.SUCCEEDED,
      actorId: actor.id,
      actorRole: actor.role,
      resourceType: 'users',
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { count: result.items.length, page: query.page || 1 },
    });

    return {
      users: toSafeUsers(result.items),
      meta: result.meta,
    };
  }, 1800); // Cache for 30 minutes
};

const getUserById = async (userId, actor, requestContext = {}) => {
  // Check if actor has permission to view this user
  if (!canViewUser(actor, userId)) {
    throw new AppError('Forbidden', 403);
  }

  const cacheKey = cacheService.buildCacheKey('user:id', { userId });

  return cacheService.withCache(cacheKey, async () => {
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
        ipAddress: requestContext.ipAddress || null,
        userAgent: requestContext.userAgent || null,
      });
    }

    return toSafeUser(user);
  }, 3600); // Cache for 1 hour
};

module.exports = {
  getMe,
  updateMe,
  listUsers,
  getUserById,
};
