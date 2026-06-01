const { STORAGE_PROVIDERS, UPLOAD_CONFIG } = require('../../src/config/upload');

describe('upload config', () => {
  describe('STORAGE_PROVIDERS', () => {
    it('exports LOCAL provider constant', () => {
      expect(STORAGE_PROVIDERS.LOCAL).toBe('local');
    });

    it('has no magic strings', () => {
      Object.values(STORAGE_PROVIDERS).forEach((value) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('UPLOAD_CONFIG', () => {
    it('defines maxFileSize', () => {
      expect(UPLOAD_CONFIG.maxFileSize).toEqual(5 * 1024 * 1024);
    });

    it('defines allowedMimeTypes as array', () => {
      expect(Array.isArray(UPLOAD_CONFIG.allowedMimeTypes)).toBe(true);
      expect(UPLOAD_CONFIG.allowedMimeTypes.length).toBeGreaterThan(0);
    });

    it('includes common image MIME types', () => {
      expect(UPLOAD_CONFIG.allowedMimeTypes).toContain('image/jpeg');
      expect(UPLOAD_CONFIG.allowedMimeTypes).toContain('image/png');
    });

    it('includes PDF MIME type', () => {
      expect(UPLOAD_CONFIG.allowedMimeTypes).toContain('application/pdf');
    });

    it('includes text MIME type', () => {
      expect(UPLOAD_CONFIG.allowedMimeTypes).toContain('text/plain');
    });

    it('defines uploadDirectory', () => {
      expect(UPLOAD_CONFIG.uploadDirectory).toBe('uploads');
    });
  });
});
