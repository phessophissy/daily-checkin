/**
 * Security Utilities
 * Cryptography, validation, and security helpers
 */

class SecurityUtils {
  /**
   * Hash string with SHA-256
   */
  static async hashSHA256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate Stacks address
   */
  static isValidStacksAddress(address) {
    return /^(S|s)[A-Z0-9]{32}$/.test(address) || /^(sp|SM)[A-Z0-9]{30}$/.test(address);
  }

  /**
   * Validate email
   */
  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Sanitize HTML
   */
  static sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Escape HTML
   */
  static escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Validate URL
   */
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate random token
   */
  static generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken() {
    const token = this.generateToken(32);
    localStorage.setItem('csrf-token', token);
    return token;
  }

  /**
   * Verify CSRF token
   */
  static verifyCSRFToken(token) {
    const stored = localStorage.getItem('csrf-token');
    return token === stored;
  }

  /**
   * Password strength checker
   */
  static checkPasswordStrength(password) {
    const strength = {
      score: 0,
      level: 'weak',
      feedback: []
    };

    if (password.length >= 8) strength.score++;
    else strength.feedback.push('Password should be at least 8 characters');

    if (password.length >= 12) strength.score++;
    if (/[a-z]/.test(password)) strength.score++;
    else strength.feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) strength.score++;
    else strength.feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) strength.score++;
    else strength.feedback.push('Add numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength.score++;
    else strength.feedback.push('Add special characters');

    const levels = ['weak', 'weak', 'fair', 'good', 'strong', 'very-strong'];
    strength.level = levels[strength.score] || 'very-strong';

    return strength;
  }

  /**
   * Rate limiter
   */
  static createRateLimiter(maxRequests, windowMs) {
    const requests = [];

    return {
      isAllowed() {
        const now = Date.now();
        requests.push(now);

        while (requests.length > 0 && requests[0] < now - windowMs) {
          requests.shift();
        }

        return requests.length <= maxRequests;
      },

      getRemainingRequests() {
        const now = Date.now();
        while (requests.length > 0 && requests[0] < now - windowMs) {
          requests.shift();
        }
        return Math.max(0, maxRequests - requests.length);
      }
    };
  }
}

/**
 * Content Security Policy Helper
 */
class CSPHelper {
  static generateCSPHeader() {
    return {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "font-src": ["'self'", "fonts.googleapis.com"],
      "connect-src": ["'self'", "https:"],
      "frame-ancestors": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"]
    };
  }

  static headerToString(header) {
    return Object.entries(header)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');
  }
}

/**
 * API Security Manager
 */
class APISecurityManager {
  constructor() {
    this.apiKey = null;
    this.rateLimiters = new Map();
  }

  /**
   * Set API key
   */
  setAPIKey(key) {
    this.apiKey = key;
  }

  /**
   * Get auth header
   */
  getAuthHeader() {
    if (!this.apiKey) return null;
    return { 'Authorization': `Bearer ${this.apiKey}` };
  }

  /**
   * Add rate limiter for endpoint
   */
  addRateLimiter(endpoint, maxRequests = 60, windowMs = 60000) {
    const limiter = SecurityUtils.createRateLimiter(maxRequests, windowMs);
    this.rateLimiters.set(endpoint, limiter);
  }

  /**
   * Check rate limit
   */
  checkRateLimit(endpoint) {
    const limiter = this.rateLimiters.get(endpoint);
    if (!limiter) return true;
    return limiter.isAllowed();
  }

  /**
   * Get remaining requests
   */
  getRemainingRequests(endpoint) {
    const limiter = this.rateLimiters.get(endpoint);
    if (!limiter) return -1;
    return limiter.getRemainingRequests();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SecurityUtils,
    CSPHelper,
    APISecurityManager
  };
}
