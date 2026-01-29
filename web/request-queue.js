/**
 * Request Queue Manager
 * Queue and batch API requests
 */

class RequestQueue {
  constructor(config = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent || 3,
      maxQueueSize: config.maxQueueSize || 100,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      ...config
    };

    this.queue = [];
    this.active = 0;
    this.completed = 0;
    this.failed = 0;
  }

  /**
   * Add request to queue
   */
  enqueue(request) {
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new Error('Queue is full');
    }

    const queuedRequest = {
      id: Date.now() + Math.random(),
      ...request,
      retries: 0,
      createdAt: new Date()
    };

    this.queue.push(queuedRequest);
    this.process();

    return queuedRequest.id;
  }

  /**
   * Process queue
   */
  async process() {
    while (this.active < this.config.maxConcurrent && this.queue.length > 0) {
      const request = this.queue.shift();
      this.active++;

      try {
        const result = await this.executeRequest(request);
        this.completed++;
        if (request.callback) {
          request.callback(null, result);
        }
      } catch (error) {
        if (request.retries < this.config.retries) {
          request.retries++;
          this.queue.push(request);
        } else {
          this.failed++;
          if (request.callback) {
            request.callback(error);
          }
        }
      } finally {
        this.active--;
        this.process();
      }
    }
  }

  /**
   * Execute request
   */
  async executeRequest(request) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.config.timeout);

      request.fn()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      queueSize: this.queue.length,
      active: this.active,
      completed: this.completed,
      failed: this.failed,
      total: this.completed + this.failed + this.queue.length
    };
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = [];
  }

  /**
   * Pause processing
   */
  pause() {
    this.paused = true;
  }

  /**
   * Resume processing
   */
  resume() {
    this.paused = false;
    this.process();
  }
}

/**
 * Batch Request Manager
 */
class BatchRequestManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.batches = new Map();
  }

  /**
   * Create batch
   */
  createBatch(batchId, options = {}) {
    if (this.batches.has(batchId)) {
      throw new Error(`Batch ${batchId} already exists`);
    }

    this.batches.set(batchId, {
      id: batchId,
      requests: [],
      options,
      createdAt: new Date()
    });

    return batchId;
  }

  /**
   * Add request to batch
   */
  addRequest(batchId, request) {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    batch.requests.push(request);
  }

  /**
   * Execute batch
   */
  async executeBatch(batchId) {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    const results = [];

    for (const request of batch.requests) {
      try {
        const result = await this.apiClient[request.method](request.url, request.data);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error });
      }
    }

    this.batches.delete(batchId);
    return results;
  }

  /**
   * Get batch info
   */
  getBatchInfo(batchId) {
    return this.batches.get(batchId);
  }

  /**
   * Cancel batch
   */
  cancelBatch(batchId) {
    this.batches.delete(batchId);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RequestQueue,
    BatchRequestManager
  };
}
