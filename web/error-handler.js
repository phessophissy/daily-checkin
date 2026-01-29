/**
 * Error Handler
 * Centralized error handling and recovery
 */

class ErrorHandler {
  constructor(config = {}) {
    this.config = {
      logErrors: config.logErrors !== false,
      reportErrors: config.reportErrors || false,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };

    this.errorCallbacks = [];
    this.errorLog = [];
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'uncaught');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'unhandled-promise');
    });
  }

  /**
   * Handle error
   */
  handleError(error, type = 'general') {
    const errorObj = {
      message: error?.message || String(error),
      type,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    if (this.config.logErrors) {
      console.error(`[${type}] ${errorObj.message}`);
    }

    this.errorLog.push(errorObj);

    if (this.config.reportErrors) {
      this.reportError(errorObj);
    }

    this.notifyCallbacks(errorObj);

    return errorObj;
  }

  /**
   * Report error to server
   */
  async reportError(errorObj) {
    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorObj)
      });
    } catch (err) {
      console.error('Failed to report error:', err);
    }
  }

  /**
   * Register error callback
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Notify callbacks
   */
  notifyCallbacks(errorObj) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorObj);
      } catch (err) {
        console.error('Error callback failed:', err);
      }
    });
  }

  /**
   * Get error log
   */
  getErrorLog(limit = 50) {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      recent: this.errorLog.slice(-10),
      recentHour: this.errorLog.filter(e => {
        const time = new Date(e.timestamp).getTime();
        return Date.now() - time < 3600000;
      }).length
    };

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Retry with backoff
   */
  async retryWithBackoff(fn, context = null) {
    let lastError;

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        return await fn.call(context);
      } catch (error) {
        lastError = error;
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        console.warn(`Retry attempt ${attempt + 1}/${this.config.retryAttempts} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw this.handleError(lastError, 'retry-exhausted');
  }

  /**
   * Try-catch wrapper
   */
  async tryCatch(fn, fallback = null) {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error);
      return fallback;
    }
  }
}

/**
 * Error Recovery Manager
 */
class ErrorRecoveryManager {
  constructor() {
    this.recoveryStrategies = new Map();
  }

  /**
   * Register recovery strategy
   */
  registerStrategy(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
  }

  /**
   * Recover from error
   */
  async recover(error) {
    const strategy = this.recoveryStrategies.get(error.type);

    if (strategy) {
      try {
        return await strategy(error);
      } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError);
      }
    }

    return false;
  }

  /**
   * Get recovery suggestions
   */
  getSuggestions(error) {
    const suggestions = {
      'network': 'Check your internet connection',
      'timeout': 'The request took too long. Please try again.',
      'unauthorized': 'Please log in again',
      'not-found': 'The requested resource was not found',
      'server-error': 'A server error occurred. Please try again later.',
      'validation': 'Please check your input and try again',
      'offline': 'You are offline. Some features may not work.',
    };

    return suggestions[error.type] || 'An unexpected error occurred';
  }
}

/**
 * Common error types
 */
const ErrorTypes = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  SERVER_ERROR: 'server-error',
  VALIDATION: 'validation',
  OFFLINE: 'offline',
  UNKNOWN: 'unknown'
};

/**
 * Custom error classes
 */
class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
  }
}

class NetworkError extends AppError {
  constructor(message, details) {
    super(message, ErrorTypes.NETWORK, details);
    this.name = 'NetworkError';
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, ErrorTypes.VALIDATION, details);
    this.name = 'ValidationError';
  }
}

class TimeoutError extends AppError {
  constructor(message, details) {
    super(message, ErrorTypes.TIMEOUT, details);
    this.name = 'TimeoutError';
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ErrorHandler,
    ErrorRecoveryManager,
    ErrorTypes,
    AppError,
    NetworkError,
    ValidationError,
    TimeoutError
  };
}
