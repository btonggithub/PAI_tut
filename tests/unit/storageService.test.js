jest.mock('../../src/services/file/storage/providers/localStorageProvider', () => ({
  storeFile: jest.fn().mockResolvedValue({
    storageKey: 'mock-uuid.txt',
    storedName: 'mock-uuid.txt',
  }),
  removeFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/config/upload', () => ({
  STORAGE_PROVIDERS: {
    LOCAL: 'local',
  },
}));

const storageService = require('../../src/services/file/storage/storageService');
const localStorageProvider = require('../../src/services/file/storage/providers/localStorageProvider');

describe('storageService (orchestration layer)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('storeFile', () => {
    it('delegates to local provider by default', async () => {
      const file = {
        originalname: 'test.txt',
        path: '/tmp/upload-123.txt',
      };

      const result = await storageService.storeFile(file);

      expect(localStorageProvider.storeFile).toHaveBeenCalledWith(file);
      expect(result).toHaveProperty('storageProvider', 'local');
    });

    it('includes storageProvider in result', async () => {
      const file = {
        originalname: 'test.txt',
        path: '/tmp/upload-123.txt',
      };

      const result = await storageService.storeFile(file);

      expect(result).toHaveProperty('storageKey');
      expect(result).toHaveProperty('storedName');
      expect(result).toHaveProperty('storageProvider', 'local');
    });

    it('delegates to specified provider', async () => {
      const file = {
        originalname: 'test.txt',
        path: '/tmp/upload-123.txt',
      };

      await storageService.storeFile(file, 'local');

      expect(localStorageProvider.storeFile).toHaveBeenCalledWith(file);
    });

    it('throws error for unknown provider', async () => {
      const file = {
        originalname: 'test.txt',
        path: '/tmp/upload-123.txt',
      };

      await expect(storageService.storeFile(file, 'unknown')).rejects.toThrow(
        'Unknown storage provider'
      );
    });
  });

  describe('removeFile', () => {
    it('delegates to local provider by default', async () => {
      await storageService.removeFile('uuid-key.txt');

      expect(localStorageProvider.removeFile).toHaveBeenCalledWith('uuid-key.txt');
    });

    it('delegates to specified provider', async () => {
      await storageService.removeFile('uuid-key.txt', 'local');

      expect(localStorageProvider.removeFile).toHaveBeenCalledWith('uuid-key.txt');
    });

    it('throws error for unknown provider', async () => {
      await expect(storageService.removeFile('uuid-key.txt', 'unknown')).rejects.toThrow(
        'Unknown storage provider'
      );
    });
  });

  describe('getProvider', () => {
    it('returns provider for known name', () => {
      const provider = storageService.getProvider('local');
      expect(provider).toBeDefined();
    });

    it('throws error for unknown provider', () => {
      expect(() => storageService.getProvider('unknown')).toThrow('Unknown storage provider');
    });
  });
});
