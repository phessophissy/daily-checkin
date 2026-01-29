/**
 * Performance Monitor
 * Track application performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  /**
   * Start measuring
   */
  start(label) {
    this.metrics.set(label, {
      startTime: performance.now(),
      endTime: null,
      duration: null,
    });
  }

  /**
   * End measuring
   */
  end(label) {
    const metric = this.metrics.get(label);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
    }
  }

  /**
   * Get metric
   */
  getMetric(label) {
    return this.metrics.get(label);
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics.clear();
  }

  /**
   * Log metrics
   */
  logMetrics() {
    console.table(Array.from(this.metrics.entries()).map(([label, metric]) => ({
      label,
      duration: `${metric.duration?.toFixed(2)}ms` || 'running',
    })));
  }
}

/**
 * Storage Manager
 * Enhanced local storage with features
 */

class StorageManager {
  constructor(prefix = 'app_') {
    this.prefix = prefix;
  }

  /**
   * Set item
   */
  set(key, value, ttl = null) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl,
    };

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }

  /**
   * Get item
   */
  get(key) {
    try {
      const item = JSON.parse(localStorage.getItem(this.prefix + key));

      if (!item) return null;

      if (item.ttl) {
        const elapsed = Date.now() - item.timestamp;
        if (elapsed > item.ttl) {
          this.remove(key);
          return null;
        }
      }

      return item.value;
    } catch (error) {
      return null;
    }
  }

  /**
   * Remove item
   */
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clear all
   */
  clear() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get all items
   */
  getAll() {
    const items = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const cleanKey = key.replace(this.prefix, '');
        items[cleanKey] = this.get(cleanKey);
      }
    }
    return items;
  }
}

/**
 * Network Status Monitor
 */

class NetworkStatusMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.lastStatus = this.isOnline;
    this.listeners = [];
    this.init();
  }

  /**
   * Initialize monitor
   */
  init() {
    window.addEventListener('online', () => this.handleStatusChange(true));
    window.addEventListener('offline', () => this.handleStatusChange(false));
  }

  /**
   * Handle status change
   */
  handleStatusChange(isOnline) {
    this.lastStatus = this.isOnline;
    this.isOnline = isOnline;

    this.listeners.forEach(callback => {
      callback(isOnline, this.lastStatus);
    });
  }

  /**
   * Subscribe to status changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Check connection
   */
  async checkConnection(url = '/') {
    try {
      const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      lastChanged: this.lastStatus,
    };
  }
}

/**
 * Debounce Manager
 */

class DebouncedFunction {
  constructor(fn, delay = 300) {
    this.fn = fn;
    this.delay = delay;
    this.timeoutId = null;
    this.lastCallTime = 0;
  }

  /**
   * Call function
   */
  call(...args) {
    clearTimeout(this.timeoutId);
    this.lastCallTime = Date.now();

    this.timeoutId = setTimeout(() => {
      this.fn(...args);
    }, this.delay);
  }

  /**
   * Cancel pending call
   */
  cancel() {
    clearTimeout(this.timeoutId);
  }

  /**
   * Flush pending call
   */
  flush(...args) {
    clearTimeout(this.timeoutId);
    this.fn(...args);
  }
}

/**
 * Timer Utility
 */

class Timer {
  constructor() {
    this.timers = new Map();
  }

  /**
   * Set timeout
   */
  setTimeout(id, fn, delay) {
    this.timers.set(id, setTimeout(fn, delay));
  }

  /**
   * Set interval
   */
  setInterval(id, fn, delay) {
    this.timers.set(id, setInterval(fn, delay));
  }

  /**
   * Clear timer
   */
  clear(id) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      this.timers.delete(id);
    }
  }

  /**
   * Clear all timers
   */
  clearAll() {
    this.timers.forEach((timer, id) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    this.timers.clear();
  }
}

// Create global instances
const performanceMonitor = new PerformanceMonitor();
const storageManager = new StorageManager('dailycheckin_');
const networkStatusMonitor = new NetworkStatusMonitor();
const timer = new Timer();

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PerformanceMonitor,
    StorageManager,
    NetworkStatusMonitor,
    DebouncedFunction,
    Timer,
    performanceMonitor,
    storageManager,
    networkStatusMonitor,
    timer,
  };
}
