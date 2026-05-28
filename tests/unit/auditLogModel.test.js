const AuditLog = require('../../src/models/auditLogModel');

describe('AuditLog model', () => {
  describe('schema validation', () => {
    it('requires action field', () => {
      const schema = AuditLog.schema;
      expect(schema.paths.action.isRequired).toBe(true);
    });

    it('requires result field', () => {
      const schema = AuditLog.schema;
      expect(schema.paths.result.isRequired).toBe(true);
    });

    it('allows valid result values', () => {
      const schema = AuditLog.schema;
      const resultEnum = schema.paths.result.enumValues;
      expect(resultEnum).toContain('succeeded');
      expect(resultEnum).toContain('failed');
      expect(resultEnum).toContain('forbidden');
    });

    it('has timestamps', () => {
      const schema = AuditLog.schema;
      expect(schema.paths.createdAt).toBeDefined();
      expect(schema.paths.updatedAt).toBeDefined();
    });

    it('makes metadata optional with empty object default', () => {
      const schema = AuditLog.schema;
      const metadataPath = schema.paths.metadata;
      // Default can be a function or direct value
      const defaultValue = typeof metadataPath.defaultValue === 'function' 
        ? metadataPath.defaultValue()
        : metadataPath.defaultValue;
      expect(defaultValue).toEqual({});
    });

    it('makes actorId optional', () => {
      const schema = AuditLog.schema;
      expect(schema.paths.actorId.isRequired).toBeFalsy();
    });

    it('makes resourceType optional', () => {
      const schema = AuditLog.schema;
      expect(schema.paths.resourceType.isRequired).toBeFalsy();
    });

    it('makes ipAddress optional', () => {
      const schema = AuditLog.schema;
      expect(schema.paths.ipAddress.isRequired).toBeFalsy();
    });

    it('does not have password field', () => {
      const schema = AuditLog.schema;
      expect(schema.paths.password).toBeUndefined();
    });

    it('does not have token field', () => {
      const schema = AuditLog.schema;
      expect(schema.paths.token).toBeUndefined();
    });

    it('does not have authorization field', () => {
      const schema = AuditLog.schema;
      expect(schema.paths.authorization).toBeUndefined();
    });
  });

  describe('indexes', () => {
    it('creates indexes on the schema', () => {
      const schema = AuditLog.schema;
      const indexInfo = schema._indexes;
      expect(indexInfo).toBeDefined();
      expect(indexInfo.length > 0).toBe(true);
    });
  });
});
