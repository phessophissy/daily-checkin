/**
 * Storage Utilities
 * Advanced localStorage and sessionStorage management
 */

class StorageUtils {
  constructor(prefix = 'app') {
    this.prefix = prefix;
  }

  /**
   * Set item with TTL
   */
  setItem(key, value, ttl = null) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(this._getKey(key), JSON.stringify(item));
  }

  /**
   * Get item with TTL check
   */
  getItem(key) {
    const stored = localStorage.getItem(this._getKey(key));
    if (!stored) return null;

    try {
      const item = JSON.parse(stored);
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.removeItem(key);
        return null;
      }
      return item.value;
    } catch (error) {
      return null;
    }
  }

  /**
   * Remove item
   */
  removeItem(key) {
    localStorage.removeItem(this._getKey(key));
  }

  /**
   * Clear all items with prefix
   */
  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }

  /**
   * Set multiple items
   */
  setMultiple(items) {
    Object.entries(items).forEach(([key, value]) => {
      this.setItem(key, value);
    });
  }

  /**
   * Get multiple items
   */
  getMultiple(keys) {
    return keys.reduce((acc, key) => {
      acc[key] = this.getItem(key);
      return acc;
    }, {});
  }

  /**
   * Get all items
   */
  getAll() {
    const result = {};
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => {
        const actualKey = key.replace(this.prefix + ':', '');
        result[actualKey] = this.getItem(actualKey);
      });
    return result;
  }

  /**
   * Get key
   */
  _getKey(key) {
    return `${this.prefix}:${key}`;
  }

  /**
   * Session storage methods
   */
  setSession(key, value) {
    sessionStorage.setItem(this._getKey(key), JSON.stringify(value));
  }

  getSession(key) {
    const stored = sessionStorage.getItem(this._getKey(key));
    return stored ? JSON.parse(stored) : null;
  }

  removeSession(key) {
    sessionStorage.removeItem(this._getKey(key));
  }

  clearSession() {
    Object.keys(sessionStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => sessionStorage.removeItem(key));
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageUtils;
}
