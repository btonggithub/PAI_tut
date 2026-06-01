jest.mock('../../src/repositories/file/fileRepository', () => ({
  createFileMetadata: jest.fn(),
  findFileById: jest.fn(),
  findFilesByOwner: jest.fn(),
  updateFileStatus: jest.fn(),
}));

jest.mock('../../src/services/file/storageService', () => ({
  storeFile: jest.fn().mockResolvedValue({
    storageKey: 'uuid-key.txt',
    storedName: 'uuid-key.txt',
    storageProvider: 'local',
  }),
  removeFile: jest.fn().mockResolvedValue(undefined),
}));

const AppError = require('../../src/utils/AppError');
const fileService = require('../../src/services/file/fileService');
const fileRepository = require('../../src/repositories/file/fileRepository');
const storageService = require('../../src/services/file/storageService');

const actor = { id: 'actor-id-1', role: 'user' };
const differentActor = { id: 'actor-id-2', role: 'user' };

const mockFileRecord = {
  _id: 'file-id-1',
  ownerId: 'actor-id-1',
  originalName: 'test.txt',
  storedName: 'uuid-key.txt',
  mimeType: 'text/plain',
  size: 512,
  extension: 'txt',
  storageKey: 'uuid-key.txt',
  storageProvider: 'local',
  status: 'active',
  metadata: {},
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const mockFile = {
  originalname: 'test.txt',
  mimetype: 'text/plain',
  size: 512,
  path: '/tmp/upload-123.txt',
};

describe('fileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserFile', () => {
    it('assigns ownerId from actor, not from file input', async () => {
      fileRepository.createFileMetadata.mockResolvedValue(mockFileRecord);

      await fileService.createUserFile({ actor, file: mockFile });

      expect(fileRepository.createFileMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: actor.id })
      );
    });

    it('ignores any client-provided ownerId in metadata', async () => {
      fileRepository.createFileMetadata.mockResolvedValue(mockFileRecord);

      await fileService.createUserFile({
        actor,
        file: mockFile,
        metadata: { ownerId: 'attacker-id' },
      });

      expect(fileRepository.createFileMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: actor.id })
      );
    });

    it('calls storageService.storeFile before creating metadata', async () => {
      fileRepository.createFileMetadata.mockResolvedValue(mockFileRecord);

      await fileService.createUserFile({ actor, file: mockFile });

      expect(storageService.storeFile).toHaveBeenCalledWith(mockFile);
      expect(fileRepository.createFileMetadata).toHaveBeenCalled();

      const storeOrder = storageService.storeFile.mock.invocationCallOrder[0];
      const createOrder = fileRepository.createFileMetadata.mock.invocationCallOrder[0];
      expect(storeOrder).toBeLessThan(createOrder);
    });

    it('returns a safe file DTO without exposing storageKey', async () => {
      fileRepository.createFileMetadata.mockResolvedValue(mockFileRecord);

      const result = await fileService.createUserFile({ actor, file: mockFile });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('ownerId');
      expect(result).toHaveProperty('originalName');
      expect(result).toHaveProperty('mimeType');
      expect(result).toHaveProperty('size');
      expect(result).not.toHaveProperty('storageKey');
      expect(result).not.toHaveProperty('storedName');
      expect(result).not.toHaveProperty('path');
    });
  });

  describe('listUserFiles', () => {
    it('queries by actor id, not by query params', async () => {
      fileRepository.findFilesByOwner.mockResolvedValue({
        items: [mockFileRecord],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      await fileService.listUserFiles({ actor, query: {} });

      expect(fileRepository.findFilesByOwner).toHaveBeenCalledWith(actor.id, expect.any(Object));
    });

    it('returns files and meta', async () => {
      fileRepository.findFilesByOwner.mockResolvedValue({
        items: [mockFileRecord],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const result = await fileService.listUserFiles({ actor, query: {} });

      expect(result).toHaveProperty('files');
      expect(result).toHaveProperty('meta');
      expect(result.files).toHaveLength(1);
    });

    it('returns safe file DTOs without storageKey', async () => {
      fileRepository.findFilesByOwner.mockResolvedValue({
        items: [mockFileRecord],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const result = await fileService.listUserFiles({ actor, query: {} });

      expect(result.files[0]).not.toHaveProperty('storageKey');
      expect(result.files[0]).not.toHaveProperty('storedName');
    });
  });

  describe('getUserFile', () => {
    it('returns safe file DTO when actor owns the file', async () => {
      fileRepository.findFileById.mockResolvedValue(mockFileRecord);

      const result = await fileService.getUserFile({ actor, fileId: 'file-id-1' });

      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('storageKey');
    });

    it('throws 404 when file is not found', async () => {
      fileRepository.findFileById.mockResolvedValue(null);

      await expect(fileService.getUserFile({ actor, fileId: 'missing-id' })).rejects.toMatchObject({
        message: 'File not found',
        statusCode: 404,
      });
    });

    it('throws 403 when actor does not own the file', async () => {
      fileRepository.findFileById.mockResolvedValue(mockFileRecord);

      await expect(
        fileService.getUserFile({ actor: differentActor, fileId: 'file-id-1' })
      ).rejects.toMatchObject({
        message: 'Forbidden',
        statusCode: 403,
      });
    });

    it('does not expose internal filesystem paths in DTO', async () => {
      fileRepository.findFileById.mockResolvedValue(mockFileRecord);

      const result = await fileService.getUserFile({ actor, fileId: 'file-id-1' });

      const values = Object.values(result).map(String);
      const hasPath = values.some((v) => v.includes('/tmp') || v.includes('/uploads') || v.includes('\\'));
      expect(hasPath).toBe(false);
    });
  });
});
