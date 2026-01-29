/**
 * Circuit Breaker Pattern
 * Prevent cascade failures
 */

class CircuitBreaker {
  constructor(config = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 2,
      timeout: config.timeout || 60000, // 1 minute
      ...config
    };

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  /**
   * Execute request with circuit breaker
   */
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttemptTime) {
        console.log('⚡ Circuit breaker: trying HALF_OPEN');
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= this.config.successThreshold) {
          console.log('✅ Circuit breaker: closing to CLOSED');
          this.reset();
        }
      } else {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.config.failureThreshold) {
        console.log('🔴 Circuit breaker: opening to OPEN');
        this.open();
      }

      throw error;
    }
  }

  /**
   * Open circuit
   */
  open() {
    this.state = 'OPEN';
    this.nextAttemptTime = Date.now() + this.config.timeout;
  }

  /**
   * Reset circuit
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  /**
   * Get state
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Circuit Breaker Manager
 */
class CircuitBreakerManager {
  constructor() {
    this.breakers = new Map();
  }

  /**
   * Create breaker
   */
  createBreaker(name, config) {
    if (this.breakers.has(name)) {
      return this.breakers.get(name);
    }

    const breaker = new CircuitBreaker(config);
    this.breakers.set(name, breaker);
    return breaker;
  }

  /**
   * Get breaker
   */
  getBreaker(name) {
    return this.breakers.get(name);
  }

  /**
   * Execute with breaker
   */
  async execute(name, fn, config = {}) {
    let breaker = this.breakers.get(name);
    if (!breaker) {
      breaker = this.createBreaker(name, config);
    }

    return breaker.execute(fn);
  }

  /**
   * Reset breaker
   */
  resetBreaker(name) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.reset();
    }
  }

  /**
   * Reset all breakers
   */
  resetAll() {
    this.breakers.forEach(breaker => breaker.reset());
  }

  /**
   * Get all states
   */
  getAllStates() {
    const states = {};
    this.breakers.forEach((breaker, name) => {
      states[name] = breaker.getState();
    });
    return states;
  }
}

/**
 * Bulkhead Pattern (isolate failures)
 */
class Bulkhead {
  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent;
    this.active = 0;
    this.queue = [];
  }

  /**
   * Execute with bulkhead
   */
  async execute(fn) {
    if (this.active >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.active++;

    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      active: this.active,
      queued: this.queue.length,
      available: this.maxConcurrent - this.active
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CircuitBreaker,
    CircuitBreakerManager,
    Bulkhead
  };
}
