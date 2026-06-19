const AppError = require('../../utils/AppError');
const { canManageUsers } = require('../../policies/userPolicy');
const userService = require('../user/userService');
const fileRepository = require('../../repositories/file/fileRepository');
const systemService = require('../system/systemService');

const toSafeFile = (file) => ({
  id: file._id ? String(file._id) : String(file.id),
  ownerId: String(file.ownerId),
  originalName: file.originalName,
  mimeType: file.mimeType,
  size: file.size,
  extension: file.extension,
  storageProvider: file.storageProvider,
  status: file.status,
  metadata: file.metadata,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
});

const ensureAdminAccess = (actor) => {
  if (!canManageUsers(actor)) {
    throw new AppError('Forbidden', 403);
  }
};

const listAdminUsers = async ({ query = {}, actor, requestContext = {} }) => {
  ensureAdminAccess(actor);
  return userService.listUsers(query, actor, requestContext);
};

const getAdminUserById = async ({ userId, actor, requestContext = {} }) => {
  ensureAdminAccess(actor);
  return userService.getUserById(userId, actor, requestContext);
};

const listAdminFiles = async ({ query = {}, actor }) => {
  ensureAdminAccess(actor);

  const result = await fileRepository.findFiles(query);

  return {
    files: result.items.map(toSafeFile),
    meta: result.meta,
  };
};

const getAdminFileById = async ({ fileId, actor }) => {
  ensureAdminAccess(actor);

  const file = await fileRepository.findFileById(fileId);

  if (!file) {
    throw new AppError('File not found', 404);
  }

  return toSafeFile(file);
};

const getAdminSystemInfo = async ({ actor }) => {
  ensureAdminAccess(actor);
  return systemService.getSystemInfo();
};

module.exports = {
  listAdminUsers,
  getAdminUserById,
  listAdminFiles,
  getAdminFileById,
  getAdminSystemInfo,
};