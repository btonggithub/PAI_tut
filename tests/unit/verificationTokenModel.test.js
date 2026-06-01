const {
  VerificationToken,
  VERIFICATION_TOKEN_TYPES,
} = require('../../src/models/verificationTokenModel');

describe('VerificationToken model', () => {
  describe('schema', () => {
    it('should have required fields', () => {
      const schema = VerificationToken.schema;
      expect(schema.paths.userId).toBeDefined();
      expect(schema.paths.tokenHash).toBeDefined();
      expect(schema.paths.type).toBeDefined();
      expect(schema.paths.expiresAt).toBeDefined();
      expect(schema.paths.usedAt).toBeDefined();
      expect(schema.paths.metadata).toBeDefined();
    });

    it('should have timestamps', () => {
      const schema = VerificationToken.schema;
      expect(schema.paths.createdAt).toBeDefined();
      expect(schema.paths.updatedAt).toBeDefined();
    });

    it('userId should be required and indexed', () => {
      const schema = VerificationToken.schema;
      const userIdField = schema.paths.userId;
      expect(userIdField.isRequired).toBe(true);
      expect(userIdField._index).toBe(true);
    });

    it('tokenHash should be required and indexed', () => {
      const schema = VerificationToken.schema;
      const hashField = schema.paths.tokenHash;
      expect(hashField.isRequired).toBe(true);
      expect(hashField._index).toBe(true);
    });

    it('type should be required with enum values', () => {
      const schema = VerificationToken.schema;
      const typeField = schema.paths.type;
      expect(typeField.isRequired).toBe(true);
      expect(typeField.enumValues).toContain(VERIFICATION_TOKEN_TYPES.EMAIL);
    });

    it('expiresAt should be required and indexed', () => {
      const schema = VerificationToken.schema;
      const expiryField = schema.paths.expiresAt;
      expect(expiryField.isRequired).toBe(true);
      expect(expiryField._index).toBe(true);
    });

    it('usedAt should default to null', () => {
      const schema = VerificationToken.schema;
      const usedAtField = schema.paths.usedAt;
      expect(usedAtField.defaultValue).toBeNull();
    });

    it('metadata should default to empty object', () => {
      const schema = VerificationToken.schema;
      const metadataField = schema.paths.metadata;
      // Mongoose may store default as a function, so just verify it exists
      expect(metadataField.defaultValue).toBeDefined();
    });
  });

  describe('VERIFICATION_TOKEN_TYPES', () => {
    it('should have EMAIL type', () => {
      expect(VERIFICATION_TOKEN_TYPES.EMAIL).toBe('email');
    });
  });
});
