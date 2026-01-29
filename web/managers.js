/**
 * Theme Manager
 * Handles theme switching and customization
 */

class ThemeManager {
  constructor() {
    this.themes = {
      metallic: {
        name: 'Metallic',
        colors: {
          gold: '#d4af37',
          silver: '#c0c0c0',
          darkSilver: '#b0b0b0',
          platinum: '#e5e4e2',
          copper: '#b87333',
          darkBg: '#0d0d0d',
          mediumBg: '#1a1a1a',
          lightBg: '#2d2d2d',
          textPrimary: '#e8e8e8',
          textSecondary: '#b0b0b0',
        },
      },
    };

    this.currentTheme = 'metallic';
    this.init();
  }

  /**
   * Initialize theme
   */
  init() {
    const saved = localStorage.getItem('dailycheckin_theme');
    if (saved && this.themes[saved]) {
      this.currentTheme = saved;
    }
    this.apply();
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.themes[this.currentTheme];
  }

  /**
   * Get color from current theme
   */
  getColor(colorName) {
    const colors = this.themes[this.currentTheme].colors;
    return colors[colorName] || '#d4af37';
  }

  /**
   * Set theme
   */
  setTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme ${themeName} not found`);
      return;
    }

    this.currentTheme = themeName;
    localStorage.setItem('dailycheckin_theme', themeName);
    this.apply();
  }

  /**
   * Apply theme to DOM
   */
  apply() {
    const root = document.documentElement;
    const colors = this.getTheme().colors;

    Object.entries(colors).forEach(([name, value]) => {
      root.style.setProperty(`--theme-${name}`, value);
    });

    // Dispatch event
    if (typeof EventBus !== 'undefined' && eventBus) {
      eventBus.emit('theme-changed', this.currentTheme);
    }
  }

  /**
   * Get all available themes
   */
  getAvailableThemes() {
    return Object.keys(this.themes);
  }

  /**
   * Add custom theme
   */
  addTheme(name, config) {
    this.themes[name] = config;
  }

  /**
   * Export current theme as CSS
   */
  exportAsCSS() {
    const colors = this.getTheme().colors;
    let css = ':root {\n';

    Object.entries(colors).forEach(([name, value]) => {
      css += `  --theme-${name}: ${value};\n`;
    });

    css += '}';
    return css;
  }
}

/**
 * State Management
 * Simple state manager for application state
 */
class StateManager {
  constructor(initialState = {}) {
    this.state = initialState;
    this.subscribers = [];
    this.middleware = [];
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get specific state value
   */
  getValue(path) {
    const keys = path.split('.');
    let value = this.state;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return null;
    }

    return value;
  }

  /**
   * Update state
   */
  setState(updates) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // Run middleware
    for (const mw of this.middleware) {
      mw(oldState, this.state, updates);
    }

    // Notify subscribers
    this.subscribers.forEach(callback => {
      callback(this.state, oldState, updates);
    });
  }

  /**
   * Update nested state value
   */
  setNestedValue(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();

    let target = this.state;
    for (const key of keys) {
      if (!target[key]) target[key] = {};
      target = target[key];
    }

    target[lastKey] = value;

    // Trigger state change
    this.setState({ ...this.state });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Add middleware
   */
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  /**
   * Reset to initial state
   */
  reset(initialState = {}) {
    this.state = initialState;
    this.subscribers.forEach(callback => {
      callback(this.state, {}, {});
    });
  }

  /**
   * Get state snapshot
   */
  snapshot() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Restore from snapshot
   */
  restore(snapshot) {
    this.state = JSON.parse(JSON.stringify(snapshot));
    this.setState({ ...this.state });
  }
}

/**
 * Logger
 * Simple logging utility with levels
 */
class Logger {
  constructor(name = 'App', level = 'info') {
    this.name = name;
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    this.level = this.levels[level] || 1;
  }

  /**
   * Log debug message
   */
  debug(...args) {
    if (this.level <= this.levels.debug) {
      console.log(`[${this.name}]`, ...args);
    }
  }

  /**
   * Log info message
   */
  info(...args) {
    if (this.level <= this.levels.info) {
      console.log(`[${this.name}]`, ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(...args) {
    if (this.level <= this.levels.warn) {
      console.warn(`[${this.name}]`, ...args);
    }
  }

  /**
   * Log error message
   */
  error(...args) {
    if (this.level <= this.levels.error) {
      console.error(`[${this.name}]`, ...args);
    }
  }

  /**
   * Set logging level
   */
  setLevel(level) {
    this.level = this.levels[level] || 1;
  }

  /**
   * Create child logger
   */
  child(name) {
    const childLogger = new Logger(`${this.name}:${name}`, Object.keys(this.levels).find(k => this.levels[k] === this.level));
    childLogger.level = this.level;
    return childLogger;
  }
}

/**
 * Cache Manager
 * Simple caching utility
 */
class CacheManager {
  constructor(ttl = 3600000) { // 1 hour default
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Set cache item
   */
  set(key, value, ttl = null) {
    const expiresAt = Date.now() + (ttl || this.ttl);
    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  /**
   * Get cache item
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Check if key exists in cache
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete cache item
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get all keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }
}

// Create global instances
const themeManager = new ThemeManager();
const appState = new StateManager({
  wallet: {
    connected: false,
    address: null,
    network: 'testnet',
  },
  user: {
    totalCheckins: 0,
    consecutiveDays: 0,
    stxEarned: 0,
    lastCheckin: null,
  },
  ui: {
    loading: false,
    error: null,
    notification: null,
  },
});
const logger = new Logger('DailyCheckin');
const cache = new CacheManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThemeManager,
    StateManager,
    Logger,
    CacheManager,
    themeManager,
    appState,
    logger,
    cache,
  };
}
