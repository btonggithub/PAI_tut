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
    it('hashes a token', async () => {
      const token = generateToken();
      const hashed = await hashToken(token);
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBeGreaterThan(50); // bcrypt produces ~60 char hashes
    });

    it('produces different hashes for the same token', async () => {
      const token = generateToken();
      const hash1 = await hashToken(token);
      const hash2 = await hashToken(token);
      expect(hash1).not.toBe(hash2); // bcrypt includes salt
    });
  });

  describe('compareToken', () => {
    it('returns true for matching tokens', async () => {
      const token = generateToken();
      const hashed = await hashToken(token);
      const result = await compareToken(token, hashed);
      expect(result).toBe(true);
    });

    it('returns false for non-matching tokens', async () => {
      const token1 = generateToken();
      const token2 = generateToken();
      const hashed = await hashToken(token1);
      const result = await compareToken(token2, hashed);
      expect(result).toBe(false);
    });
  });
});
