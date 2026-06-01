const path = require('path');
const AppError = require('../../utils/AppError');
const fileRepository = require('../../repositories/file/fileRepository');
const storageService = require('./storageService');

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

const createUserFile = async ({ actor, file, metadata = {} }) => {
  const { storageKey, storedName, storageProvider } = await storageService.storeFile(file);

  const extension = file.originalname
    ? path.extname(file.originalname).replace('.', '').toLowerCase()
    : '';

  const fileRecord = await fileRepository.createFileMetadata({
    ownerId: actor.id,
    originalName: file.originalname,
    storedName,
    mimeType: file.mimetype,
    size: file.size,
    extension,
    storageKey,
    storageProvider,
    status: 'active',
    metadata,
  });

  return toSafeFile(fileRecord);
};

const listUserFiles = async ({ actor, query = {} }) => {
  const result = await fileRepository.findFilesByOwner(actor.id, query);

  return {
    files: result.items.map(toSafeFile),
    meta: result.meta,
  };
};

const getUserFile = async ({ actor, fileId }) => {
  const file = await fileRepository.findFileById(fileId);

  if (!file) {
    throw new AppError('File not found', 404);
  }

  if (String(file.ownerId) !== String(actor.id)) {
    throw new AppError('Forbidden', 403);
  }

  return toSafeFile(file);
};

module.exports = {
  createUserFile,
  listUserFiles,
  getUserFile,
};
