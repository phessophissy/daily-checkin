/**
 * Middleware System
 * Middleware pipeline for requests and responses
 */

class Middleware {
  constructor() {
    this.middlewares = [];
  }

  /**
   * Use middleware
   */
  use(fn) {
    this.middlewares.push(fn);
  }

  /**
   * Execute middleware chain
   */
  async execute(context, finalHandler = null) {
    let index = 0;

    const next = async () => {
      if (index < this.middlewares.length) {
        const fn = this.middlewares[index++];
        await fn(context, next);
      } else if (finalHandler) {
        await finalHandler(context);
      }
    };

    await next();
  }

  /**
   * Clear middlewares
   */
  clear() {
    this.middlewares = [];
  }
}

/**
 * Request Middleware Manager
 */
class RequestMiddleware extends Middleware {
  constructor() {
    super();
    this.setupDefaultMiddleware();
  }

  /**
   * Setup default middleware
   */
  setupDefaultMiddleware() {
    // Logging middleware
    this.use(async (context, next) => {
      const start = Date.now();
      await next();
      const duration = Date.now() - start;
      console.log(`${context.method} ${context.url} - ${duration}ms`);
    });

    // Error handling middleware
    this.use(async (context, next) => {
      try {
        await next();
      } catch (error) {
        context.error = error;
        console.error('Middleware error:', error);
      }
    });
  }

  /**
   * Add auth middleware
   */
  addAuthMiddleware(getToken) {
    this.use(async (context, next) => {
      const token = getToken();
      if (token) {
        context.headers = {
          ...context.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      await next();
    });
  }

  /**
   * Add transform middleware
   */
  addTransformMiddleware(transform) {
    this.use(async (context, next) => {
      if (context.data) {
        context.data = transform(context.data);
      }
      await next();
    });
  }

  /**
   * Add validation middleware
   */
  addValidationMiddleware(validate) {
    this.use(async (context, next) => {
      const errors = validate(context);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      await next();
    });
  }

  /**
   * Add retry middleware
   */
  addRetryMiddleware(maxRetries = 3, delay = 1000) {
    this.use(async (context, next) => {
      let lastError;
      for (let i = 0; i < maxRetries; i++) {
        try {
          await next();
          return;
        } catch (error) {
          lastError = error;
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      throw lastError;
    });
  }

  /**
   * Add rate limit middleware
   */
  addRateLimitMiddleware(maxRequests, timeWindow) {
    const requestTimes = [];

    this.use(async (context, next) => {
      const now = Date.now();
      requestTimes.push(now);

      // Remove old requests outside time window
      while (requestTimes.length > 0 && requestTimes[0] < now - timeWindow) {
        requestTimes.shift();
      }

      if (requestTimes.length > maxRequests) {
        throw new Error('Rate limit exceeded');
      }

      await next();
    });
  }

  /**
   * Add timeout middleware
   */
  addTimeoutMiddleware(timeout) {
    this.use(async (context, next) => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      );

      await Promise.race([next(), timeoutPromise]);
    });
  }

  /**
   * Add cache middleware
   */
  addCacheMiddleware(cache) {
    this.use(async (context, next) => {
      if (context.method === 'GET') {
        const cached = cache.get(context.url);
        if (cached) {
          context.cached = true;
          context.response = cached;
          return;
        }
      }

      await next();

      if (context.method === 'GET' && context.response) {
        cache.set(context.url, context.response);
      }
    });
  }
}

/**
 * Response Middleware Manager
 */
class ResponseMiddleware extends Middleware {
  /**
   * Add transform middleware
   */
  addTransformMiddleware(transform) {
    this.use(async (context, next) => {
      await next();
      if (context.response) {
        context.response = transform(context.response);
      }
    });
  }

  /**
   * Add error handling middleware
   */
  addErrorHandlingMiddleware(handler) {
    this.use(async (context, next) => {
      try {
        await next();
      } catch (error) {
        context.error = handler(error);
        throw context.error;
      }
    });
  }

  /**
   * Add success handler middleware
   */
  addSuccessHandlerMiddleware(handler) {
    this.use(async (context, next) => {
      await next();
      if (context.response && !context.error) {
        context.response = handler(context.response);
      }
    });
  }

  /**
   * Add logging middleware
   */
  addLoggingMiddleware(logger) {
    this.use(async (context, next) => {
      await next();
      logger({
        url: context.url,
        method: context.method,
        status: context.response?.status,
        error: context.error
      });
    });
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Middleware,
    RequestMiddleware,
    ResponseMiddleware
  };
}
