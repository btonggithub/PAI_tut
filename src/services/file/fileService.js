const path = require('path');
const AppError = require('../../utils/AppError');
const fileRepository = require('../../repositories/file/fileRepository');
const storageService = require('./storage/storageService');
const { recordAuditEvent } = require('../audit/auditLogService');
const AUDIT_ACTIONS = require('../audit/auditActions');
const AUDIT_RESULTS = require('../audit/auditResults');
const { STORAGE_PROVIDERS } = require('../../config/upload');
const cacheService = require('../cache/cacheService');

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

const createUserFile = async ({ actor, file, metadata = {}, requestContext = {} }) => {
  const { storageKey, storedName, storageProvider } = await storageService.storeFile(file);

  const extension = file.originalname
    ? path.extname(file.originalname).replace('.', '').toLowerCase()
    : '';

  try {
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

    cacheService.invalidateFileCache({ ownerId: actor.id });

    // Record successful upload audit event
    await recordAuditEvent({
      action: AUDIT_ACTIONS.FILE_UPLOAD,
      result: AUDIT_RESULTS.SUCCEEDED,
      actorId: actor.id,
      actorRole: actor.role,
      resourceType: 'file',
      resourceId: fileRecord._id ? String(fileRecord._id) : String(fileRecord.id),
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { fileName: file.originalname, size: file.size },
    });

    return toSafeFile(fileRecord);
  } catch (err) {
    // Compensation logic: clean up stored file if metadata save fails
    await storageService.removeFile(storageKey, storageProvider);

    // Record failed upload audit event
    await recordAuditEvent({
      action: AUDIT_ACTIONS.FILE_UPLOAD,
      result: AUDIT_RESULTS.FAILED,
      actorId: actor.id,
      actorRole: actor.role,
      resourceType: 'file',
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: 'metadata persistence failed', fileName: file.originalname },
    }).catch(() => {
      // Audit logging failures should not block the main error propagation
    });

    throw err;
  }
};

const listUserFiles = async ({ actor, query = {}, requestContext = {} }) => {
  const cacheKey = cacheService.buildCacheKey('files:list', {
    ownerId: actor.id,
    ...query,
  });

  const data = await cacheService.withCache(cacheKey, async () => {
    const result = await fileRepository.findFilesByOwner(actor.id, query);

    return {
      files: result.items.map(toSafeFile),
      meta: result.meta,
    };
  }, 1800);

  // Record file list audit event
  await recordAuditEvent({
    action: AUDIT_ACTIONS.FILE_LIST,
    result: AUDIT_RESULTS.SUCCEEDED,
    actorId: actor.id,
    actorRole: actor.role,
    resourceType: 'files',
    ipAddress: requestContext.ipAddress || null,
    userAgent: requestContext.userAgent || null,
    metadata: { count: data.files.length, page: query.page || 1 },
  }).catch(() => {
    // Audit logging failures should not break file listing
  });

  return data;
};

const getUserFile = async ({ actor, fileId, requestContext = {} }) => {
  const cacheKey = cacheService.buildCacheKey('file:id', { fileId });

  const file = await cacheService.withCache(cacheKey, async () => {
    const found = await fileRepository.findFileById(fileId);

    if (!found) {
      throw new AppError('File not found', 404);
    }

    return toSafeFile(found);
  }, 3600);

  if (String(file.ownerId) !== String(actor.id)) {
    // Record forbidden file access audit event
    await recordAuditEvent({
      action: AUDIT_ACTIONS.FILE_VIEW,
      result: AUDIT_RESULTS.FORBIDDEN,
      actorId: actor.id,
      actorRole: actor.role,
      resourceType: 'file',
      resourceId: fileId,
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: 'ownership check failed' },
    }).catch(() => {
      // Audit logging failures should not break error response
    });

    throw new AppError('Forbidden', 403);
  }

  // Record successful file view audit event
  await recordAuditEvent({
    action: AUDIT_ACTIONS.FILE_VIEW,
    result: AUDIT_RESULTS.SUCCEEDED,
    actorId: actor.id,
    actorRole: actor.role,
    resourceType: 'file',
    resourceId: fileId,
    ipAddress: requestContext.ipAddress || null,
    userAgent: requestContext.userAgent || null,
    metadata: {},
  }).catch(() => {
    // Audit logging failures should not break file view
  });

  return file;
};

module.exports = {
  createUserFile,
  listUserFiles,
  getUserFile,
};
