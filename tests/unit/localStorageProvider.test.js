const fs = require('fs');
const path = require('path');

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    rename: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../src/config/upload', () => ({
  UPLOAD_CONFIG: {
    uploadDirectory: 'uploads',
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'application/pdf'],
  },
  STORAGE_PROVIDERS: {
    LOCAL: 'local',
  },
}));

const localStorageProvider = require('../../src/services/file/storage/providers/localStorageProvider');

describe('localStorageProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateStorageKey', () => {
    it('generates a key that does not use the original file name', () => {
      const key = localStorageProvider.generateStorageKey('txt');
      expect(key).not.toContain('original');
      expect(key).not.toContain('document');
    });

    it('includes the extension when provided', () => {
      const key = localStorageProvider.generateStorageKey('pdf');
      expect(key).toMatch(/\.pdf$/);
    });

    it('generates a key without extension when extension is empty', () => {
      const key = localStorageProvider.generateStorageKey('');
      expect(key).not.toMatch(/\./);
    });

    it('generates unique keys on repeated calls', () => {
      const key1 = localStorageProvider.generateStorageKey('txt');
      const key2 = localStorageProvider.generateStorageKey('txt');
      expect(key1).not.toBe(key2);
    });
  });

  describe('storeFile', () => {
    it('returns storageKey and storedName', async () => {
      const file = {
        originalname: 'document.pdf',
        path: '/tmp/upload-123.pdf',
      };

      const result = await localStorageProvider.storeFile(file);

      expect(result).toHaveProperty('storageKey');
      expect(result).toHaveProperty('storedName');
    });

    it('does not use originalname directly as storage key', async () => {
      const file = {
        originalname: 'dangerous-name.pdf',
        path: '/tmp/upload-123.pdf',
      };

      const result = await localStorageProvider.storeFile(file);

      expect(result.storageKey).not.toBe('dangerous-name.pdf');
      expect(result.storedName).not.toBe('dangerous-name.pdf');
      expect(result.storageKey).not.toContain('dangerous-name');
    });

    it('calls fs.promises.rename to move the temp file', async () => {
      const file = {
        originalname: 'test.txt',
        path: '/tmp/upload-456.txt',
      };

      await localStorageProvider.storeFile(file);

      expect(fs.promises.rename).toHaveBeenCalledTimes(1);
      const [srcArg] = fs.promises.rename.mock.calls[0];
      expect(srcArg).toBe('/tmp/upload-456.txt');
    });

    it('creates upload directory if it does not exist', async () => {
      fs.existsSync.mockReturnValueOnce(false);

      const file = {
        originalname: 'test.png',
        path: '/tmp/upload-789.png',
      };

      await localStorageProvider.storeFile(file);

      expect(fs.promises.mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    it('throws AppError when file rename fails', async () => {
      const renameError = new Error('permission denied');
      fs.promises.rename.mockRejectedValueOnce(renameError);

      const file = {
        originalname: 'test.txt',
        path: '/tmp/upload-123.txt',
      };

      await expect(localStorageProvider.storeFile(file)).rejects.toMatchObject({
        message: 'Failed to store file',
        statusCode: 500,
      });
    });
  });

  describe('removeFile', () => {
    it('calls fs.promises.unlink with the correct path', async () => {
      await localStorageProvider.removeFile('uuid-key.txt');

      expect(fs.promises.unlink).toHaveBeenCalledTimes(1);
      const [filePath] = fs.promises.unlink.mock.calls[0];
      expect(filePath).toContain('uuid-key.txt');
    });

    it('does not throw when file does not exist (ENOENT)', async () => {
      const enoentError = Object.assign(new Error('not found'), { code: 'ENOENT' });
      fs.promises.unlink.mockRejectedValueOnce(enoentError);

      await expect(
        localStorageProvider.removeFile('missing-key.txt')
      ).resolves.not.toThrow();
    });

    it('throws AppError when unlink fails with non-ENOENT error', async () => {
      const ioError = Object.assign(new Error('permission denied'), { code: 'EACCES' });
      fs.promises.unlink.mockRejectedValueOnce(ioError);

      await expect(localStorageProvider.removeFile('locked-key.txt')).rejects.toMatchObject({
        message: 'Failed to remove file',
        statusCode: 500,
      });
    });
  });
});
