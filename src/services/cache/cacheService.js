/**
 * Cache Service - Business logic orchestration for caching
 * Handles cache operations with logging for hits/misses
 * Provides domain-oriented cache wrapper methods
 */

const cacheStore = require('../../utils/cache');

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const CACHE_DEFAULTS = {
  USER_PROFILE: { ttl: 3600, key: 'user:profile' }, // 1 hour
  USER_LIST: { ttl: 1800, key: 'users:list' }, // 30 minutes
  USER_BY_ID: { ttl: 3600, key: 'user:id' }, // 1 hour
  FILE_LIST: { ttl: 1800, key: 'files:list' }, // 30 minutes
  FILE_BY_ID: { ttl: 3600, key: 'file:id' }, // 1 hour
};

/**
 * Build cache key with parameters
 * @param {string} baseKey - Base cache key
 * @param {object} params - Parameters to include in key
 * @returns {string} Full cache key
 */
const buildCacheKey = (baseKey, params = {}) => {
  if (Object.keys(params).length === 0) {
    return baseKey;
  }

  const paramStr = Object.keys(params)
    .sort()
    .map((k) => `${k}=${JSON.stringify(params[k])}`)
    .join(':');

  return `${baseKey}:${paramStr}`;
};

/**
 * Wrap an async function with caching
 * @param {string} cacheKey - Cache key
 * @param {function} fetcher - Async function to fetch value
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} Cached or fetched value
 */
const withCache = async (cacheKey, fetcher, ttl = 3600) => {
  // Check cache
  if (cacheStore.has(cacheKey)) {
    console.log(`[CACHE_HIT] ${cacheKey}`);
    return cacheStore.get(cacheKey);
  }

  // Cache miss - fetch value
  console.log(`[CACHE_MISS] ${cacheKey}`);
  const value = await fetcher();

  // Store in cache
  cacheStore.set(cacheKey, value, ttl);

  return value;
};

/**
 * Invalidate cache by key pattern
 * @param {string|RegExp} pattern - Key pattern to invalidate
 */
const invalidateByPattern = (pattern) => {
  const stats = cacheStore.getStats();

  if (pattern instanceof RegExp) {
    stats.keys.forEach((key) => {
      if (pattern.test(key)) {
        cacheStore.delete(key);
        console.log(`[CACHE_INVALIDATE] ${key}`);
      }
    });
  } else if (typeof pattern === 'string') {
    // Exact match
    if (cacheStore.has(pattern)) {
      cacheStore.delete(pattern);
      console.log(`[CACHE_INVALIDATE] ${pattern}`);
    }
  }
};

/**
 * Invalidate all user-related caches
 * @param {string} userId - User ID to invalidate
 */
const invalidateUserCache = (userId) => {
  // Invalidate this user's profile cache
  invalidateByPattern(buildCacheKey('user:profile', { userId }));

  // Invalidate this user's specific cache
  invalidateByPattern(buildCacheKey('user:id', { userId }));

  // Invalidate all user list caches (since user data may have changed)
  invalidateByPattern(/^users:list:/);
};

/**
 * Invalidate all file-related caches
 * @param {string} ownerId - File owner ID to invalidate list caches for
 * @param {string} fileId - File ID to invalidate
 */
const invalidateFileCache = ({ ownerId, fileId } = {}) => {
  if (fileId) {
    invalidateByPattern(buildCacheKey('file:id', { fileId }));
  }

  if (ownerId) {
    invalidateByPattern(new RegExp(`^files:list:.*ownerId=${escapeRegExp(JSON.stringify(ownerId))}`));
  } else {
    invalidateByPattern(/^files:list:/);
  }
};

/**
 * Invalidate all caches
 */
const invalidateAll = () => {
  cacheStore.clear();
  console.log('[CACHE_INVALIDATE_ALL] All caches cleared');
};

/**
 * Get cache statistics
 * @returns {object} Cache stats including size and keys
 */
const getStats = () => {
  return cacheStore.getStats();
};

module.exports = {
  withCache,
  buildCacheKey,
  invalidateByPattern,
  invalidateUserCache,
  invalidateFileCache,
  invalidateAll,
  getStats,
  CACHE_DEFAULTS,
};
