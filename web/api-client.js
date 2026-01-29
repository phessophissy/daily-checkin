/**
 * Advanced API Client
 * Enhanced HTTP client with retry, caching, and interceptors
 */

class APIClient {
  constructor(config = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 30000,
      headers: config.headers || {},
      ...config
    };

    this.interceptors = {
      request: [],
      response: []
    };
  }

  /**
   * Request interceptor
   */
  use(type, callback) {
    this.interceptors[type].push(callback);
  }

  /**
   * Execute request
   */
  async request(method, url, data = null, options = {}) {
    let config = {
      method,
      url: this.config.baseURL + url,
      headers: { ...this.config.headers, ...options.headers },
      timeout: options.timeout || this.config.timeout,
      ...options
    };

    // Request interceptors
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config);
    }

    try {
      const response = await this.executeRequest(config, data);

      let result = response;

      // Response interceptors
      for (const interceptor of this.interceptors.response) {
        result = await interceptor(result);
      }

      return result;
    } catch (error) {
      console.error(`Request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  /**
   * Execute actual request
   */
  async executeRequest(config, data) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const fetchOptions = {
        method: config.method,
        headers: config.headers,
        signal: controller.signal
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(config.url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      const result = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      return { status: response.status, data: result, headers: response.headers };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.request('GET', url, null, options);
  }

  /**
   * POST request
   */
  async post(url, data, options = {}) {
    return this.request('POST', url, data, options);
  }

  /**
   * PUT request
   */
  async put(url, data, options = {}) {
    return this.request('PUT', url, data, options);
  }

  /**
   * PATCH request
   */
  async patch(url, data, options = {}) {
    return this.request('PATCH', url, data, options);
  }

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    return this.request('DELETE', url, null, options);
  }

  /**
   * HEAD request
   */
  async head(url, options = {}) {
    return this.request('HEAD', url, null, options);
  }
}

/**
 * Stacks API Client
 */
class StacksAPIClient extends APIClient {
  constructor(network = 'testnet') {
    const baseURLs = {
      'testnet': 'https://stacks-testnet-api.blockstack.org',
      'mainnet': 'https://stacks-api.blockstack.org'
    };

    super({ baseURL: baseURLs[network] });
    this.network = network;
  }

  /**
   * Get account info
   */
  async getAccount(address) {
    return this.get(`/v2/accounts/${address}`);
  }

  /**
   * Get account balance
   */
  async getBalance(address) {
    const account = await this.getAccount(address);
    return account.data.balance;
  }

  /**
   * Get account transactions
   */
  async getTransactions(address, limit = 20, offset = 0) {
    return this.get(`/v2/accounts/${address}/transactions?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get transaction
   */
  async getTransaction(txId) {
    return this.get(`/v2/transactions/${txId}`);
  }

  /**
   * Broadcast transaction
   */
  async broadcastTransaction(tx) {
    return this.post('/v2/transactions', tx);
  }

  /**
   * Get contract
   */
  async getContract(address, contractName) {
    return this.get(`/v2/contracts/source/${address}/${contractName}`);
  }

  /**
   * Call read-only function
   */
  async callReadOnlyFunction(contract, functionName, args) {
    const payload = {
      contract_address: contract.address,
      contract_name: contract.name,
      function_name: functionName,
      arguments: args
    };

    return this.post('/v2/contracts/call-read', payload);
  }

  /**
   * Get network info
   */
  async getNetworkInfo() {
    return this.get('/v2/info');
  }
}

/**
 * API Client with Retry Logic
 */
class RetryableAPIClient extends APIClient {
  constructor(config = {}) {
    super(config);
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;

    // Add retry interceptor
    this.use('response', async (response) => {
      if (response.status >= 500 || response.status === 429) {
        throw new Error(`Retryable error: ${response.status}`);
      }
      return response;
    });
  }

  /**
   * Execute with retry
   */
  async request(method, url, data = null, options = {}) {
    let lastError;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await super.request(method, url, data, options);
      } catch (error) {
        lastError = error;
        const delay = this.retryDelay * Math.pow(2, attempt);
        console.warn(`Retry ${attempt + 1}/${this.maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    APIClient,
    StacksAPIClient,
    RetryableAPIClient
  };
}
