/**
 * Cache Utility - In-memory cache abstraction
 * Provides a simple cache interface with TTL support
 * Can be extended to support Redis in the future
 */

const DEFAULT_TTL = 3600; // 1 hour in seconds

class CacheStore {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined
   */
  get(key) {
    return this.store.get(key);
  }

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600)
   */
  set(key, value, ttl = DEFAULT_TTL) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store value
    this.store.set(key, value);

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    if (typeof timer.unref === 'function') {
      timer.unref();
    }

    this.timers.set(key, timer);
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Delete value
    this.store.delete(key);
  }

  /**
   * Check if a key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is not expired
   */
  has(key) {
    return this.store.has(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    // Clear store
    this.store.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Singleton instance
const cacheStore = new CacheStore();

module.exports = cacheStore;
