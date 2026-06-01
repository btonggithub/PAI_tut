const cacheStore = require('../../src/utils/cache');

describe('CacheStore (In-memory Cache)', () => {
  beforeEach(() => {
    cacheStore.clear();
  });

  afterEach(() => {
    cacheStore.clear();
  });

  describe('set and get', () => {
    it('stores and retrieves a value', () => {
      cacheStore.set('key1', 'value1');
      expect(cacheStore.get('key1')).toBe('value1');
    });

    it('stores and retrieves objects', () => {
      const obj = { name: 'John', age: 30 };
      cacheStore.set('user:1', obj);
      expect(cacheStore.get('user:1')).toEqual(obj);
    });

    it('stores and retrieves arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      cacheStore.set('list:1', arr);
      expect(cacheStore.get('list:1')).toEqual(arr);
    });

    it('returns undefined for non-existent keys', () => {
      expect(cacheStore.get('nonexistent')).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('removes a value from cache', () => {
      cacheStore.set('key1', 'value1');
      expect(cacheStore.get('key1')).toBe('value1');

      cacheStore.delete('key1');
      expect(cacheStore.get('key1')).toBeUndefined();
    });

    it('handles deleting non-existent keys gracefully', () => {
      expect(() => cacheStore.delete('nonexistent')).not.toThrow();
    });
  });

  describe('has', () => {
    it('returns true for existing keys', () => {
      cacheStore.set('key1', 'value1');
      expect(cacheStore.has('key1')).toBe(true);
    });

    it('returns false for non-existent keys', () => {
      expect(cacheStore.has('nonexistent')).toBe(false);
    });
  });

  describe('TTL expiration', () => {
    it('removes value after TTL expires', (done) => {
      cacheStore.set('key1', 'value1', 1); // 1 second TTL

      expect(cacheStore.get('key1')).toBe('value1');

      setTimeout(() => {
        expect(cacheStore.get('key1')).toBeUndefined();
        done();
      }, 1100);
    });

    it('keeps value while within TTL', (done) => {
      cacheStore.set('key1', 'value1', 2); // 2 second TTL

      setTimeout(() => {
        expect(cacheStore.get('key1')).toBe('value1');
        done();
      }, 500);
    });

    it('uses default TTL if not specified', () => {
      cacheStore.set('key1', 'value1'); // Should use default TTL
      expect(cacheStore.get('key1')).toBe('value1');
    });
  });

  describe('clear', () => {
    it('removes all values from cache', () => {
      cacheStore.set('key1', 'value1');
      cacheStore.set('key2', 'value2');
      cacheStore.set('key3', 'value3');

      expect(cacheStore.getStats().size).toBe(3);

      cacheStore.clear();

      expect(cacheStore.getStats().size).toBe(0);
      expect(cacheStore.get('key1')).toBeUndefined();
      expect(cacheStore.get('key2')).toBeUndefined();
      expect(cacheStore.get('key3')).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('returns cache size and keys', () => {
      cacheStore.set('key1', 'value1');
      cacheStore.set('key2', 'value2');

      const stats = cacheStore.getStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });

    it('returns empty stats for empty cache', () => {
      const stats = cacheStore.getStats();

      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });

  describe('overwriting cached values', () => {
    it('overwrites existing values with new TTL', (done) => {
      cacheStore.set('key1', 'value1', 1);
      expect(cacheStore.get('key1')).toBe('value1');

      cacheStore.set('key1', 'value2', 2);
      expect(cacheStore.get('key1')).toBe('value2');

      setTimeout(() => {
        expect(cacheStore.get('key1')).toBe('value2');
        done();
      }, 1100);
    });
  });
});
