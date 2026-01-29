/**
 * Utility Functions for Daily Checkin
 * Helper functions for common operations
 */

// String Utilities
const StringUtils = {
  /**
   * Truncate long strings
   */
  truncate(str, length = 10, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  /**
   * Truncate address for display (first 8 and last 4 chars)
   */
  truncateAddress(address) {
    if (!address || address.length < 16) return address;
    return address.substring(0, 8) + '...' + address.substring(address.length - 4);
  },

  /**
   * Format STX amount with proper decimals
   */
  formatStx(amount, decimals = 3) {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? '0.000' : parsed.toFixed(decimals);
  },

  /**
   * Convert microSTX to STX
   */
  microStxToStx(microStx) {
    return microStx / 1000000;
  },

  /**
   * Convert STX to microSTX
   */
  stxToMicroStx(stx) {
    return Math.floor(stx * 1000000);
  },

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Format camelCase to Title Case
   */
  camelToTitleCase(str) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase());
  },
};

// Date Utilities
const DateUtils = {
  /**
   * Format date to readable string
   */
  formatDate(date, format = 'MMM DD, YYYY') {
    if (typeof date === 'string') date = new Date(date);
    if (!(date instanceof Date)) return '';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const dayName = days[date.getDay()];

    return format
      .replace('MMM', month)
      .replace('DD', String(day).padStart(2, '0'))
      .replace('YYYY', year)
      .replace('DDD', dayName);
  },

  /**
   * Format time to readable string
   */
  formatTime(date, format = 'HH:mm') {
    if (typeof date === 'string') date = new Date(date);
    if (!(date instanceof Date)) return '';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * Check if date is today
   */
  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  /**
   * Get days difference between two dates
   */
  daysDifference(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelative(date) {
    if (typeof date === 'string') date = new Date(date);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return this.formatDate(date);
  },
};

// Storage Utilities
const StorageUtils = {
  /**
   * Set item in localStorage with prefix
   */
  setItem(key, value, prefix = 'dailycheckin_') {
    try {
      const prefixedKey = prefix + key;
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(prefixedKey, serialized);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  /**
   * Get item from localStorage with prefix
   */
  getItem(key, prefix = 'dailycheckin_') {
    try {
      const prefixedKey = prefix + key;
      const item = localStorage.getItem(prefixedKey);
      if (!item) return null;

      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },

  /**
   * Remove item from localStorage with prefix
   */
  removeItem(key, prefix = 'dailycheckin_') {
    try {
      localStorage.removeItem(prefix + key);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  /**
   * Clear all items with prefix
   */
  clear(prefix = 'dailycheckin_') {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  /**
   * Get all items with prefix
   */
  getAll(prefix = 'dailycheckin_') {
    const items = {};
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          const cleanKey = key.replace(prefix, '');
          items[cleanKey] = this.getItem(cleanKey, prefix);
        }
      });
    } catch (error) {
      console.error('Storage error:', error);
    }
    return items;
  },
};

// DOM Utilities
const DOMUtils = {
  /**
   * Query selector
   */
  query(selector) {
    return document.querySelector(selector);
  },

  /**
   * Query all selectors
   */
  queryAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  },

  /**
   * Create element with attributes
   */
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value;
      } else if (key === 'style') {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    if (content) {
      element.innerHTML = content;
    }

    return element;
  },

  /**
   * Add class to element
   */
  addClass(element, className) {
    element?.classList.add(className);
  },

  /**
   * Remove class from element
   */
  removeClass(element, className) {
    element?.classList.remove(className);
  },

  /**
   * Toggle class on element
   */
  toggleClass(element, className) {
    element?.classList.toggle(className);
  },

  /**
   * Show element
   */
  show(element) {
    if (element) element.style.display = '';
  },

  /**
   * Hide element
   */
  hide(element) {
    if (element) element.style.display = 'none';
  },

  /**
   * Set HTML content
   */
  setHTML(element, html) {
    if (element) element.innerHTML = html;
  },

  /**
   * Set text content
   */
  setText(element, text) {
    if (element) element.textContent = text;
  },

  /**
   * Get all checked checkboxes
   */
  getCheckedCheckboxes(container) {
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked'));
  },

  /**
   * Trigger event on element
   */
  trigger(element, eventName) {
    if (element) element.dispatchEvent(new Event(eventName));
  },
};

// Validation Utilities
const ValidationUtils = {
  /**
   * Validate Stacks address
   */
  isValidStacksAddress(address) {
    return /^(SP|SM)[0-9A-Z]{38}$/.test(address);
  },

  /**
   * Validate STX amount
   */
  isValidAmount(amount) {
    const parsed = parseFloat(amount);
    return !isNaN(parsed) && parsed > 0;
  },

  /**
   * Validate email
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Validate transaction hash
   */
  isValidTxHash(hash) {
    return /^0x[0-9a-f]{64}$/i.test(hash);
  },

  /**
   * Validate required field
   */
  isRequired(value) {
    return value && value.trim().length > 0;
  },
};

// Error Utilities
class AppError extends Error {
  constructor(message, code = 'UNKNOWN', details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// Promise Utilities
const PromiseUtils = {
  /**
   * Retry promise with exponential backoff
   */
  async retry(fn, maxRetries = 3, delay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  },

  /**
   * Wait for condition to be true
   */
  async waitFor(condition, timeout = 30000, interval = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (condition()) return true;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new AppError('Timeout waiting for condition', 'TIMEOUT');
  },

  /**
   * Timeout promise
   */
  timeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new AppError('Operation timeout', 'TIMEOUT')), ms);
      }),
    ]);
  },
};

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StringUtils,
    DateUtils,
    StorageUtils,
    DOMUtils,
    ValidationUtils,
    AppError,
    PromiseUtils,
  };
}
