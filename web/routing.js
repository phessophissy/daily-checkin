/**
 * Simple Router
 * Client-side routing for single page application
 */

class Router {
  constructor(options = {}) {
    this.routes = new Map();
    this.history = [];
    this.currentPath = '';
    this.onRouteChange = options.onRouteChange || null;
    this.notFoundHandler = options.notFoundHandler || null;
    this.init();
  }

  /**
   * Initialize router
   */
  init() {
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('popstate', () => this.handleRouteChange());
    this.handleRouteChange();
  }

  /**
   * Register route
   */
  register(path, handler, options = {}) {
    const route = {
      path,
      handler,
      pattern: this.pathToRegex(path),
      meta: options.meta || {},
    };

    this.routes.set(path, route);
  }

  /**
   * Register multiple routes
   */
  registerMany(routeConfigs) {
    routeConfigs.forEach(config => {
      this.register(config.path, config.handler, config);
    });
  }

  /**
   * Navigate to route
   */
  navigate(path, state = null) {
    window.location.hash = path;
    window.history.pushState(state, '', `#${path}`);
    this.handleRouteChange();
  }

  /**
   * Handle route change
   */
  handleRouteChange() {
    const path = this.getCurrentPath();

    if (path === this.currentPath) return;

    const route = this.matchRoute(path);

    if (route) {
      this.currentPath = path;
      this.history.push({
        path,
        timestamp: new Date().toISOString(),
      });

      route.handler({
        path,
        params: this.extractParams(path, route.pattern),
      });

      this.onRouteChange?.(path);
    } else {
      this.notFoundHandler?.(path);
    }
  }

  /**
   * Get current path
   */
  getCurrentPath() {
    return window.location.hash.slice(1) || '/';
  }

  /**
   * Match route
   */
  matchRoute(path) {
    for (const route of this.routes.values()) {
      if (route.pattern.test(path)) {
        return route;
      }
    }
    return null;
  }

  /**
   * Extract parameters from path
   */
  extractParams(path, pattern) {
    const matches = pattern.exec(path);
    if (!matches) return {};

    const params = {};
    for (let i = 1; i < matches.length; i++) {
      params[`param${i}`] = matches[i];
    }
    return params;
  }

  /**
   * Convert path to regex pattern
   */
  pathToRegex(path) {
    const escaped = path.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const pattern = escaped.replace(/:(\w+)/g, '([^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  /**
   * Get route history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Go back
   */
  back() {
    window.history.back();
  }

  /**
   * Go forward
   */
  forward() {
    window.history.forward();
  }
}

/**
 * Animation Controller
 * Handle scroll and intersection animations
 */

class AnimationController {
  constructor(options = {}) {
    this.observerOptions = options.observerOptions || {
      threshold: 0.1,
      rootMargin: '0px',
    };
    this.observer = null;
    this.animations = new Map();
    this.init();
  }

  /**
   * Initialize animation controller
   */
  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerAnimation(entry.target);
        }
      });
    }, this.observerOptions);
  }

  /**
   * Register animation
   */
  register(selector, animationName, options = {}) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      this.observer?.observe(element);
      this.animations.set(element, {
        name: animationName,
        delay: options.delay || 0,
        duration: options.duration || 600,
      });
    });
  }

  /**
   * Trigger animation
   */
  triggerAnimation(element) {
    const animation = this.animations.get(element);
    if (!animation) return;

    element.style.animation = `${animation.name} ${animation.duration}ms ease-out ${animation.delay}ms both`;

    // Unobserve after animation
    setTimeout(() => {
      this.observer?.unobserve(element);
    }, animation.delay + animation.duration);
  }

  /**
   * Animate element
   */
  animate(element, animationName, options = {}) {
    element.style.animation = `${animationName} ${options.duration || 600}ms ease-out both`;
  }

  /**
   * Dispose
   */
  dispose() {
    this.observer?.disconnect();
    this.animations.clear();
  }
}

/**
 * Security Utilities
 * Handle security-related operations
 */

class SecurityManager {
  /**
   * Sanitize HTML string to prevent XSS
   */
  static sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeURL(url) {
    try {
      const urlObj = new URL(url);
      // Only allow http and https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return null;
      }
      return urlObj.href;
    } catch {
      return null;
    }
  }

  /**
   * Escape special characters in string
   */
  static escapeString(str) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return str.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Validate Stacks address
   */
  static isValidStacksAddress(address) {
    return /^(SP|SM)[0-9A-Z]{38}$/.test(address);
  }

  /**
   * Hash string using SHA-256
   */
  static async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  }

  /**
   * Convert buffer to hex string
   */
  static bufferToHex(buffer) {
    const view = new Uint8Array(buffer);
    return Array.from(view)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
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
   * Validate and parse JSON safely
   */
  static parseJSON(str, defaultValue = null) {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Check Content Security Policy
   */
  static getCSP() {
    return "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
  }
}

// Create global instances
const router = new Router();
const animationController = new AnimationController();
const securityManager = SecurityManager;

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Router,
    AnimationController,
    SecurityManager,
    router,
    animationController,
    securityManager,
  };
}
