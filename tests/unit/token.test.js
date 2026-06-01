const { generateToken, hashToken, compareToken } = require('../../src/utils/token');

describe('Token utilities', () => {
  describe('generateToken', () => {
    it('generates a cryptographically secure token', () => {
      const token = generateToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes in hex = 64 chars
    });

    it('generates unique tokens on each call', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('hashToken', () => {
    it('hashes a token using SHA256 deterministic hashing', () => {
      const token = generateToken();
      const hashed = hashToken(token);
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBe(64); // SHA256 produces 64 character hex string
    });

    it('produces identical hashes for the same token (deterministic)', () => {
      const token = generateToken();
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2); // SHA256 is deterministic
    });

    it('is synchronous', () => {
      const token = generateToken();
      const hashed = hashToken(token);
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
    });
  });

  describe('compareToken', () => {
    it('returns true for matching tokens', () => {
      const token = generateToken();
      const hashed = hashToken(token);
      const result = compareToken(token, hashed);
      expect(result).toBe(true);
    });

    it('returns false for non-matching tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      const hashed = hashToken(token1);
      const result = compareToken(token2, hashed);
      expect(result).toBe(false);
    });

    it('is synchronous', () => {
      const token = generateToken();
      const hashed = hashToken(token);
      const result = compareToken(token, hashed);
      expect(typeof result).toBe('boolean');
    });
  });
});
