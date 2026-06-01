const File = require('../../src/models/fileModel');
const { FILE_STATUS } = require('../../src/models/fileModel');

describe('File model', () => {
  describe('schema validation', () => {
    it('requires ownerId field', () => {
      const schema = File.schema;
      expect(schema.paths.ownerId.isRequired).toBe(true);
    });

    it('requires originalName field', () => {
      const schema = File.schema;
      expect(schema.paths.originalName.isRequired).toBe(true);
    });

    it('requires storedName field', () => {
      const schema = File.schema;
      expect(schema.paths.storedName.isRequired).toBe(true);
    });

    it('requires mimeType field', () => {
      const schema = File.schema;
      expect(schema.paths.mimeType.isRequired).toBe(true);
    });

    it('requires size field', () => {
      const schema = File.schema;
      expect(schema.paths.size.isRequired).toBe(true);
    });

    it('requires storageKey field', () => {
      const schema = File.schema;
      expect(schema.paths.storageKey.isRequired).toBe(true);
    });

    it('metadata defaults to empty object', () => {
      const schema = File.schema;
      const metadataPath = schema.paths.metadata;
      const defaultValue =
        typeof metadataPath.defaultValue === 'function'
          ? metadataPath.defaultValue()
          : metadataPath.defaultValue;
      expect(defaultValue).toEqual({});
    });

    it('status defaults to active', () => {
      const schema = File.schema;
      const statusPath = schema.paths.status;
      const defaultValue =
        typeof statusPath.defaultValue === 'function'
          ? statusPath.defaultValue()
          : statusPath.defaultValue;
      expect(defaultValue).toBe('active');
    });

    it('status allows valid enum values', () => {
      const schema = File.schema;
      const enumValues = schema.paths.status.enumValues;
      expect(enumValues).toContain('active');
      expect(enumValues).toContain('pending');
      expect(enumValues).toContain('deleted');
    });

    it('storageProvider defaults to local', () => {
      const schema = File.schema;
      const providerPath = schema.paths.storageProvider;
      const defaultValue =
        typeof providerPath.defaultValue === 'function'
          ? providerPath.defaultValue()
          : providerPath.defaultValue;
      expect(defaultValue).toBe('local');
    });

    it('has timestamps', () => {
      const schema = File.schema;
      expect(schema.paths.createdAt).toBeDefined();
      expect(schema.paths.updatedAt).toBeDefined();
    });

    it('does not have a buffer field for raw file data', () => {
      const schema = File.schema;
      expect(schema.paths.buffer).toBeUndefined();
      expect(schema.paths.data).toBeUndefined();
      expect(schema.paths.content).toBeUndefined();
    });

    it('does not have a localPath field', () => {
      const schema = File.schema;
      expect(schema.paths.localPath).toBeUndefined();
      expect(schema.paths.path).toBeUndefined();
    });
  });

  describe('FILE_STATUS constants', () => {
    it('exports FILE_STATUS with correct values', () => {
      expect(FILE_STATUS.ACTIVE).toBe('active');
      expect(FILE_STATUS.PENDING).toBe('pending');
      expect(FILE_STATUS.DELETED).toBe('deleted');
    });
  });
});
