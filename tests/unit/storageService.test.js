const fs = require('fs');
const path = require('path');

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  promises: {
    rename: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

const storageService = require('../../src/services/file/storageService');

describe('storageService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateStorageKey', () => {
    it('generates a key that does not use the original file name', () => {
      const originalName = 'my-secret-file.txt';
      const key = storageService.generateStorageKey('txt');
      expect(key).not.toBe(originalName);
      expect(key).not.toContain('my-secret-file');
    });

    it('includes the extension when provided', () => {
      const key = storageService.generateStorageKey('pdf');
      expect(key).toMatch(/\.pdf$/);
    });

    it('generates a key without extension when extension is empty', () => {
      const key = storageService.generateStorageKey('');
      expect(key).not.toMatch(/\./);
    });

    it('generates unique keys on repeated calls', () => {
      const key1 = storageService.generateStorageKey('txt');
      const key2 = storageService.generateStorageKey('txt');
      expect(key1).not.toBe(key2);
    });
  });

  describe('storeFile', () => {
    it('returns storageKey, storedName, and storageProvider', async () => {
      const file = {
        originalname: 'document.pdf',
        path: '/tmp/upload-123.pdf',
      };

      const result = await storageService.storeFile(file);

      expect(result).toHaveProperty('storageKey');
      expect(result).toHaveProperty('storedName');
      expect(result).toHaveProperty('storageProvider', 'local');
    });

    it('does not use originalname directly as storage key', async () => {
      const file = {
        originalname: 'dangerous-name.pdf',
        path: '/tmp/upload-123.pdf',
      };

      const result = await storageService.storeFile(file);

      expect(result.storageKey).not.toBe('dangerous-name.pdf');
      expect(result.storedName).not.toBe('dangerous-name.pdf');
      expect(result.storageKey).not.toContain('dangerous-name');
    });

    it('calls fs.promises.rename to move the temp file', async () => {
      const file = {
        originalname: 'test.txt',
        path: '/tmp/upload-456.txt',
      };

      await storageService.storeFile(file);

      expect(fs.promises.rename).toHaveBeenCalledTimes(1);
      const [srcArg] = fs.promises.rename.mock.calls[0];
      expect(srcArg).toBe('/tmp/upload-456.txt');
    });

    it('creates upload directory if it does not exist', async () => {
      fs.existsSync.mockReturnValue(false);

      const file = {
        originalname: 'test.png',
        path: '/tmp/upload-789.png',
      };

      await storageService.storeFile(file);

      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });
  });

  describe('removeFile', () => {
    it('calls fs.promises.unlink with the correct path', async () => {
      await storageService.removeFile('uuid-key.txt');

      expect(fs.promises.unlink).toHaveBeenCalledTimes(1);
      const [filePath] = fs.promises.unlink.mock.calls[0];
      expect(filePath).toContain('uuid-key.txt');
    });

    it('does not throw when file does not exist (ENOENT)', async () => {
      const enoentError = Object.assign(new Error('not found'), { code: 'ENOENT' });
      fs.promises.unlink.mockRejectedValueOnce(enoentError);

      await expect(storageService.removeFile('missing-key.txt')).resolves.not.toThrow();
    });

    it('throws AppError when unlink fails with non-ENOENT error', async () => {
      const ioError = Object.assign(new Error('permission denied'), { code: 'EACCES' });
      fs.promises.unlink.mockRejectedValueOnce(ioError);

      await expect(storageService.removeFile('locked-key.txt')).rejects.toMatchObject({
        message: 'Failed to remove file',
        statusCode: 500,
      });
    });
  });
});
