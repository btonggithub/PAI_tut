/**
 * Local Storage Provider
 *
 * Filesystem-based storage implementation.
 * Owns all local filesystem operations for file storage.
 */

const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const AppError = require('../../../../utils/AppError');
const { UPLOAD_CONFIG } = require('../../../../config/upload');

const getUploadDir = () => path.resolve(UPLOAD_CONFIG.uploadDirectory);

const ensureUploadDir = async () => {
  const uploadDir = getUploadDir();
  if (!fs.existsSync(uploadDir)) {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  }
};

const generateStorageKey = (extension) => {
  const id = randomUUID();
  return extension ? `${id}.${extension}` : id;
};

const storeFile = async (file) => {
  await ensureUploadDir();

  const extension = file.originalname
    ? path.extname(file.originalname).replace('.', '').toLowerCase()
    : '';
  const storageKey = generateStorageKey(extension);
  const storedName = storageKey;
  const uploadDir = getUploadDir();
  const destPath = path.join(uploadDir, storedName);

  try {
    await fs.promises.rename(file.path, destPath);
  } catch (err) {
    throw new AppError('Failed to store file', 500);
  }

  return {
    storageKey,
    storedName,
  };
};

const removeFile = async (storageKey) => {
  const uploadDir = getUploadDir();
  const filePath = path.join(uploadDir, storageKey);

  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw new AppError('Failed to remove file', 500);
    }
  }
};

module.exports = {
  storeFile,
  removeFile,
  generateStorageKey,
};
