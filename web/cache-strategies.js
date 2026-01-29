/**
 * Cache Strategies
 * Different caching patterns for various data types
 */

class CacheStrategy {
  constructor(name = 'default') {
    this.name = name;
    this.data = new Map();
    this.timestamps = new Map();
  }

  async get(key) {
    return this.data.get(key);
  }

  async set(key, value, ttl) {
    this.data.set(key, value);
    if (ttl) {
      this.timestamps.set(key, Date.now() + ttl);
      setTimeout(() => this.data.delete(key), ttl);
    }
  }

  async delete(key) {
    this.data.delete(key);
    this.timestamps.delete(key);
  }

  async clear() {
    this.data.clear();
    this.timestamps.clear();
  }
}

/**
 * LRU Cache Strategy (Least Recently Used)
 */
class LRUCache extends CacheStrategy {
  constructor(maxSize = 100) {
    super('lru');
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  async get(key) {
    if (!this.data.has(key)) return undefined;

    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);

    return this.data.get(key);
  }

  async set(key, value, ttl) {
    if (this.data.has(key)) {
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    }

    if (this.data.size >= this.maxSize && !this.data.has(key)) {
      const leastUsed = this.accessOrder.shift();
      this.data.delete(leastUsed);
      this.timestamps.delete(leastUsed);
    }

    this.data.set(key, value);
    this.accessOrder.push(key);

    if (ttl) {
      this.timestamps.set(key, Date.now() + ttl);
      setTimeout(() => {
        this.data.delete(key);
        this.accessOrder = this.accessOrder.filter(k => k !== key);
      }, ttl);
    }
  }
}

/**
 * FIFO Cache Strategy (First In First Out)
 */
class FIFOCache extends CacheStrategy {
  constructor(maxSize = 100) {
    super('fifo');
    this.maxSize = maxSize;
    this.queue = [];
  }

  async set(key, value, ttl) {
    if (!this.data.has(key)) {
      if (this.data.size >= this.maxSize) {
        const oldest = this.queue.shift();
        this.data.delete(oldest);
        this.timestamps.delete(oldest);
      }
      this.queue.push(key);
    }

    this.data.set(key, value);

    if (ttl) {
      this.timestamps.set(key, Date.now() + ttl);
      setTimeout(() => {
        this.data.delete(key);
        this.queue = this.queue.filter(k => k !== key);
      }, ttl);
    }
  }
}

/**
 * Network Strategy (always fetch from network, update cache)
 */
class NetworkFirstStrategy extends CacheStrategy {
  constructor(apiClient) {
    super('network-first');
    this.apiClient = apiClient;
  }

  async get(key) {
    try {
      const response = await this.apiClient.get(key);
      await this.set(key, response);
      return response;
    } catch (error) {
      return this.data.get(key);
    }
  }
}

/**
 * Cache First Strategy (use cache, fallback to network)
 */
class CacheFirstStrategy extends CacheStrategy {
  constructor(apiClient) {
    super('cache-first');
    this.apiClient = apiClient;
  }

  async get(key) {
    const cached = this.data.get(key);
    if (cached) return cached;

    try {
      const response = await this.apiClient.get(key);
      await this.set(key, response);
      return response;
    } catch (error) {
      return null;
    }
  }
}

/**
 * Stale While Revalidate Strategy
 */
class StaleWhileRevalidateStrategy extends CacheStrategy {
  constructor(apiClient) {
    super('stale-while-revalidate');
    this.apiClient = apiClient;
  }

  async get(key) {
    const cached = this.data.get(key);

    if (cached) {
      this.apiClient.get(key).then(response => {
        this.set(key, response);
      }).catch(err => console.error('Revalidation failed:', err));

      return cached;
    }

    try {
      const response = await this.apiClient.get(key);
      await this.set(key, response);
      return response;
    } catch (error) {
      return null;
    }
  }
}

/**
 * Cache Strategies Manager
 */
class CacheStrategiesManager {
  constructor() {
    this.strategies = new Map();
    this.defaultStrategy = 'cache-first';
  }

  /**
   * Register strategy
   */
  registerStrategy(name, strategy) {
    this.strategies.set(name, strategy);
  }

  /**
   * Get strategy
   */
  getStrategy(name = this.defaultStrategy) {
    return this.strategies.get(name);
  }

  /**
   * Set default strategy
   */
  setDefaultStrategy(name) {
    if (this.strategies.has(name)) {
      this.defaultStrategy = name;
    }
  }

  /**
   * Cache get
   */
  async get(key, strategy = this.defaultStrategy) {
    const cacheStrategy = this.getStrategy(strategy);
    if (!cacheStrategy) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }
    return cacheStrategy.get(key);
  }

  /**
   * Cache set
   */
  async set(key, value, ttl = null, strategy = this.defaultStrategy) {
    const cacheStrategy = this.getStrategy(strategy);
    if (!cacheStrategy) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }
    return cacheStrategy.set(key, value, ttl);
  }

  /**
   * Clear all strategies
   */
  async clearAll() {
    for (const [, strategy] of this.strategies) {
      await strategy.clear();
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    const stats = {};
    for (const [name, strategy] of this.strategies) {
      stats[name] = {
        size: strategy.data.size,
        keys: Array.from(strategy.data.keys())
      };
    }
    return stats;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CacheStrategy,
    LRUCache,
    FIFOCache,
    NetworkFirstStrategy,
    CacheFirstStrategy,
    StaleWhileRevalidateStrategy,
    CacheStrategiesManager
  };
}
