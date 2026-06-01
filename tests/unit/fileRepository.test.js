const fileRepository = require('../../src/repositories/file/fileRepository');
const File = require('../../src/models/fileModel');

jest.mock('../../src/models/fileModel');

const mockFindQuery = () => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue([]),
});

describe('fileRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFileMetadata', () => {
    it('calls File.create with payload', async () => {
      const payload = {
        ownerId: 'owner-123',
        originalName: 'test.txt',
        storedName: 'uuid-stored.txt',
        mimeType: 'text/plain',
        size: 1024,
        extension: 'txt',
        storageKey: 'uuid-stored.txt',
        storageProvider: 'local',
        status: 'active',
        metadata: {},
      };

      File.create.mockResolvedValue(payload);

      await fileRepository.createFileMetadata(payload);

      expect(File.create).toHaveBeenCalledWith(payload);
    });

    it('returns the created file record', async () => {
      const payload = {
        ownerId: 'owner-123',
        originalName: 'doc.pdf',
        storedName: 'uuid.pdf',
        mimeType: 'application/pdf',
        size: 2048,
        extension: 'pdf',
        storageKey: 'uuid.pdf',
        storageProvider: 'local',
        status: 'active',
        metadata: {},
      };
      const expected = { _id: 'file-id-1', ...payload };
      File.create.mockResolvedValue(expected);

      const result = await fileRepository.createFileMetadata(payload);

      expect(result).toEqual(expected);
    });
  });

  describe('findFileById', () => {
    it('calls File.findById with fileId', async () => {
      const fileId = 'file-id-1';
      const mockFile = { _id: fileId, originalName: 'test.txt' };

      File.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockFile) });

      const result = await fileRepository.findFileById(fileId);

      expect(File.findById).toHaveBeenCalledWith(fileId);
      expect(result).toEqual(mockFile);
    });

    it('returns null when file not found', async () => {
      File.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const result = await fileRepository.findFileById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findFilesByOwner', () => {
    it('queries File.find with ownerId filter', async () => {
      const ownerId = 'owner-123';
      const mockQuery = mockFindQuery();
      File.find.mockReturnValue(mockQuery);
      File.countDocuments.mockResolvedValue(0);

      await fileRepository.findFilesByOwner(ownerId);

      expect(File.find).toHaveBeenCalledWith(expect.objectContaining({ ownerId }));
    });

    it('returns items and meta', async () => {
      const ownerId = 'owner-123';
      const items = [{ _id: 'f1', ownerId }];
      const mockQuery = mockFindQuery();
      mockQuery.lean.mockResolvedValue(items);
      File.find.mockReturnValue(mockQuery);
      File.countDocuments.mockResolvedValue(1);

      const result = await fileRepository.findFilesByOwner(ownerId);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('meta');
      expect(result.items).toEqual(items);
    });

    it('does not expose ownerId from external query input', async () => {
      const ownerId = 'owner-123';
      const maliciousQuery = { ownerId: 'attacker-456' };
      const mockQuery = mockFindQuery();
      File.find.mockReturnValue(mockQuery);
      File.countDocuments.mockResolvedValue(0);

      await fileRepository.findFilesByOwner(ownerId, maliciousQuery);

      expect(File.find).toHaveBeenCalledWith(expect.objectContaining({ ownerId: 'owner-123' }));
    });
  });

  describe('updateFileStatus', () => {
    it('calls File.findByIdAndUpdate with correct arguments', async () => {
      const fileId = 'file-id-1';
      const payload = { status: 'deleted' };
      const updated = { _id: fileId, status: 'deleted' };

      File.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) });

      const result = await fileRepository.updateFileStatus(fileId, payload);

      expect(File.findByIdAndUpdate).toHaveBeenCalledWith(
        fileId,
        payload,
        expect.objectContaining({ new: true, runValidators: true })
      );
      expect(result).toEqual(updated);
    });
  });
});
