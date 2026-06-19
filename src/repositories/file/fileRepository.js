const File = require('../../models/fileModel');
const BaseRepository = require('../base/BaseRepository');

const fileBaseRepository = new BaseRepository(File);

const createFileMetadata = async (payload) => {
  return File.create(payload);
};

const findFileById = async (fileId) => {
  return File.findById(fileId).lean();
};

const findFilesByOwner = async (ownerId, query = {}) => {
  const pagination = fileBaseRepository.buildPagination(query);
  const sort = fileBaseRepository.buildSort(query.sort, ['createdAt', 'size'], '-createdAt');

  const [items, total] = await Promise.all([
    File.find({ ownerId }).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    File.countDocuments({ ownerId }),
  ]);

  return {
    items,
    meta: fileBaseRepository.buildMeta(total, pagination),
  };
};

const findFiles = async (query = {}) => {
  return fileBaseRepository.findMany(query, {
    allowedFilters: ['ownerId', 'status', 'mimeType', 'extension'],
    allowedSortFields: ['createdAt', 'updatedAt', 'size', 'status'],
    defaultSort: '-createdAt',
    useLean: true,
  });
};

const updateFileStatus = async (fileId, payload) => {
  return File.findByIdAndUpdate(fileId, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

module.exports = {
  createFileMetadata,
  findFileById,
  findFilesByOwner,
  findFiles,
  updateFileStatus,
};
