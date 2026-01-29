/**
 * Request Utilities
 * Helper functions for HTTP requests and retries
 */

class RequestUtils {
  /**
   * Retry function with exponential backoff
   */
  static async retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Timeout promise
   */
  static timeout(promise, ms, timeoutError = 'Request timeout') {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(timeoutError)), ms)
      ),
    ]);
  }

  /**
   * Batch requests
   */
  static async batchRequests(requests, concurrency = 3) {
    const results = [];
    const executing = [];

    for (const [index, request] of requests.entries()) {
      const promise = Promise.resolve().then(() => request()).then(result => {
        results[index] = result;
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.indexOf(promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Debounce function
   */
  static debounce(fn, delay = 300) {
    let timeoutId;

    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle function
   */
  static throttle(fn, delay = 300) {
    let lastCall = 0;

    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  }

  /**
   * Memoize function
   */
  static memoize(fn) {
    const cache = new Map();

    return function (...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  }
}

/**
 * Number Utilities
 */

class NumberUtils {
  /**
   * Format number to STX
   */
  static formatStx(number, decimals = 3) {
    return parseFloat(number).toFixed(decimals);
  }

  /**
   * Convert microSTX to STX
   */
  static microStxToStx(microStx) {
    return microStx / 1000000;
  }

  /**
   * Convert STX to microSTX
   */
  static stxToMicroStx(stx) {
    return Math.round(stx * 1000000);
  }

  /**
   * Format number with thousands separator
   */
  static formatNumber(number) {
    return number.toLocaleString();
  }

  /**
   * Generate random number
   */
  static random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Clamp number
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Calculate percentage
   */
  static percentage(value, total) {
    return total === 0 ? 0 : (value / total) * 100;
  }
}

/**
 * Array Utilities
 */

class ArrayUtils {
  /**
   * Flatten array
   */
  static flatten(arr) {
    return arr.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
    }, []);
  }

  /**
   * Remove duplicates
   */
  static unique(arr) {
    return [...new Set(arr)];
  }

  /**
   * Group array by key
   */
  static groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const k = item[key];
      if (!groups[k]) groups[k] = [];
      groups[k].push(item);
      return groups;
    }, {});
  }

  /**
   * Chunk array
   */
  static chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Find index of item
   */
  static findIndex(arr, predicate) {
    return arr.findIndex(predicate);
  }

  /**
   * Remove item from array
   */
  static remove(arr, item) {
    const index = arr.indexOf(item);
    if (index > -1) arr.splice(index, 1);
    return arr;
  }

  /**
   * Sort array
   */
  static sort(arr, key, ascending = true) {
    return [...arr].sort((a, b) => {
      if (ascending) {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
  }
}

/**
 * Object Utilities
 */

class ObjectUtils {
  /**
   * Deep clone object
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge objects
   */
  static merge(target, source) {
    return Object.assign({}, target, source);
  }

  /**
   * Deep merge objects
   */
  static deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * Pick properties from object
   */
  static pick(obj, keys) {
    const result = {};
    keys.forEach(key => {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  }

  /**
   * Omit properties from object
   */
  static omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  }

  /**
   * Get nested value
   */
  static getNestedValue(obj, path) {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  /**
   * Set nested value
   */
  static setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) current[key] = {};
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return obj;
  }
}

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RequestUtils,
    NumberUtils,
    ArrayUtils,
    ObjectUtils,
  };
}
