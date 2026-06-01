const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const AppError = require('../../utils/AppError');

const UPLOAD_DIR = path.resolve('uploads');

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

const generateStorageKey = (extension) => {
  const id = randomUUID();
  return extension ? `${id}.${extension}` : id;
};

const storeFile = async (file) => {
  ensureUploadDir();

  const extension = file.originalname
    ? path.extname(file.originalname).replace('.', '').toLowerCase()
    : '';
  const storageKey = generateStorageKey(extension);
  const storedName = storageKey;
  const destPath = path.join(UPLOAD_DIR, storedName);

  await fs.promises.rename(file.path, destPath);

  return {
    storageKey,
    storedName,
    storageProvider: 'local',
  };
};

const removeFile = async (storageKey) => {
  const filePath = path.join(UPLOAD_DIR, storageKey);
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
