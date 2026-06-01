const cacheService = require('../../src/services/cache/cacheService');
const cacheStore = require('../../src/utils/cache');

describe('Cache Service', () => {
  beforeEach(() => {
    cacheStore.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cacheStore.clear();
  });

  describe('buildCacheKey', () => {
    it('builds cache key without parameters', () => {
      const key = cacheService.buildCacheKey('user:profile');
      expect(key).toBe('user:profile');
    });

    it('builds cache key with single parameter', () => {
      const key = cacheService.buildCacheKey('user:profile', { userId: '123' });
      expect(key).toContain('user:profile');
      expect(key).toContain('userId');
      expect(key).toContain('123');
    });

    it('builds cache key with multiple parameters', () => {
      const key = cacheService.buildCacheKey('users:list', { page: 1, limit: 10 });
      expect(key).toContain('users:list');
      expect(key).toContain('page');
      expect(key).toContain('limit');
    });

    it('builds consistent keys for same parameters', () => {
      const key1 = cacheService.buildCacheKey('users:list', { page: 1, limit: 10 });
      const key2 = cacheService.buildCacheKey('users:list', { page: 1, limit: 10 });
      expect(key1).toBe(key2);
    });

    it('builds different keys for different parameters', () => {
      const key1 = cacheService.buildCacheKey('users:list', { page: 1 });
      const key2 = cacheService.buildCacheKey('users:list', { page: 2 });
      expect(key1).not.toBe(key2);
    });
  });

  describe('withCache', () => {
    it('returns cached value on subsequent calls', async () => {
      const fetcher = jest.fn().mockResolvedValue('fetched-value');

      const value1 = await cacheService.withCache('key1', fetcher, 3600);
      expect(value1).toBe('fetched-value');
      expect(fetcher).toHaveBeenCalledTimes(1);

      const value2 = await cacheService.withCache('key1', fetcher, 3600);
      expect(value2).toBe('fetched-value');
      expect(fetcher).toHaveBeenCalledTimes(1); // Not called again
    });

    it('fetches value on cache miss', async () => {
      const fetcher = jest.fn().mockResolvedValue('fetched-value');

      const value = await cacheService.withCache('key1', fetcher, 3600);

      expect(value).toBe('fetched-value');
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('caches objects and complex data structures', async () => {
      const user = { id: '1', name: 'John', role: 'user' };
      const fetcher = jest.fn().mockResolvedValue(user);

      const value = await cacheService.withCache('user:1', fetcher, 3600);

      expect(value).toEqual(user);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('respects custom TTL', (done) => {
      const fetcher = jest.fn().mockResolvedValue('value');

      cacheService.withCache('key1', fetcher, 1).then((value) => {
        expect(value).toBe('value');
        expect(cacheStore.has('key1')).toBe(true);

        setTimeout(() => {
          expect(cacheStore.has('key1')).toBe(false);
          done();
        }, 1100);
      });
    });

    it('logs cache hits', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const fetcher = jest.fn().mockResolvedValue('value');

      await cacheService.withCache('key1', fetcher, 3600);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[CACHE_MISS]'));

      await cacheService.withCache('key1', fetcher, 3600);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[CACHE_HIT]'));

      consoleSpy.mockRestore();
    });

    it('logs cache misses', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const fetcher = jest.fn().mockResolvedValue('value');

      await cacheService.withCache('key1', fetcher, 3600);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[CACHE_MISS]'));

      consoleSpy.mockRestore();
    });
  });

  describe('invalidateByPattern', () => {
    it('invalidates keys matching exact string', () => {
      cacheStore.set('user:1', 'value1');
      cacheStore.set('user:2', 'value2');

      cacheService.invalidateByPattern('user:1');

      expect(cacheStore.has('user:1')).toBe(false);
      expect(cacheStore.has('user:2')).toBe(true);
    });

    it('invalidates keys matching regex pattern', () => {
      cacheStore.set('user:1', 'value1');
      cacheStore.set('user:2', 'value2');
      cacheStore.set('post:1', 'value3');

      cacheService.invalidateByPattern(/^user:/);

      expect(cacheStore.has('user:1')).toBe(false);
      expect(cacheStore.has('user:2')).toBe(false);
      expect(cacheStore.has('post:1')).toBe(true);
    });

    it('logs invalidation', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      cacheStore.set('user:1', 'value1');

      cacheService.invalidateByPattern('user:1');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[CACHE_INVALIDATE]'));

      consoleSpy.mockRestore();
    });
  });

  describe('invalidateUserCache', () => {
    it('invalidates all user-related caches', () => {
      cacheStore.set('user:profile:123', 'value1');
      cacheStore.set('user:id:123', 'value2');
      cacheStore.set('users:list:page=1', 'value3');
      cacheStore.set('user:profile:456', 'value4');

      cacheService.invalidateUserCache('123');

      expect(cacheStore.has('user:profile:123')).toBe(false);
      expect(cacheStore.has('user:id:123')).toBe(false);
      expect(cacheStore.has('users:list:page=1')).toBe(false);
      expect(cacheStore.has('user:profile:456')).toBe(true);
    });
  });

  describe('invalidateAll', () => {
    it('clears all caches', () => {
      cacheStore.set('key1', 'value1');
      cacheStore.set('key2', 'value2');
      cacheStore.set('key3', 'value3');

      expect(cacheStore.getStats().size).toBe(3);

      cacheService.invalidateAll();

      expect(cacheStore.getStats().size).toBe(0);
    });

    it('logs invalidation', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      cacheStore.set('key1', 'value1');

      cacheService.invalidateAll();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[CACHE_INVALIDATE_ALL]'));

      consoleSpy.mockRestore();
    });
  });

  describe('getStats', () => {
    it('returns cache statistics', () => {
      cacheStore.set('key1', 'value1');
      cacheStore.set('key2', 'value2');

      const stats = cacheService.getStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });

  describe('CACHE_DEFAULTS', () => {
    it('provides default cache configuration', () => {
      expect(cacheService.CACHE_DEFAULTS.USER_PROFILE).toBeDefined();
      expect(cacheService.CACHE_DEFAULTS.USER_LIST).toBeDefined();
      expect(cacheService.CACHE_DEFAULTS.USER_BY_ID).toBeDefined();

      expect(cacheService.CACHE_DEFAULTS.USER_PROFILE.ttl).toBe(3600);
      expect(cacheService.CACHE_DEFAULTS.USER_LIST.ttl).toBe(1800);
      expect(cacheService.CACHE_DEFAULTS.USER_BY_ID.ttl).toBe(3600);
    });
  });
});
