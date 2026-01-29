/**
 * HTTP Client and API Service
 * Handles all API communication with Stacks network
 */

class HttpClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.timeout = 30000;
  }

  /**
   * Set authorization header
   */
  setAuth(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
    return this;
  }

  /**
   * Make GET request
   */
  async get(url, options = {}) {
    return this.request('GET', url, null, options);
  }

  /**
   * Make POST request
   */
  async post(url, data, options = {}) {
    return this.request('POST', url, data, options);
  }

  /**
   * Make PUT request
   */
  async put(url, data, options = {}) {
    return this.request('PUT', url, data, options);
  }

  /**
   * Make DELETE request
   */
  async delete(url, options = {}) {
    return this.request('DELETE', url, null, options);
  }

  /**
   * Make generic request
   */
  async request(method, url, data = null, options = {}) {
    const fullURL = this.baseURL + url;
    const timeout = options.timeout || this.timeout;

    const config = {
      method,
      headers: { ...this.headers, ...options.headers },
    };

    if (data) {
      config.body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    try {
      const response = await Promise.race([
        fetch(fullURL, config),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
      ]);

      const contentType = response.headers.get('content-type');
      const responseData = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      return {
        status: response.status,
        data: responseData,
        headers: response.headers,
      };
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }
}

/**
 * Stacks API Service
 * Handles communication with Stacks blockchain network
 */
class StacksApiService {
  constructor(networkUrl = 'https://stacks-testnet-api.herokuapp.com') {
    this.client = new HttpClient(networkUrl);
  }

  /**
   * Get account balance
   */
  async getBalance(address) {
    try {
      const response = await this.client.get(`/v2/accounts/${address}`);
      return {
        balance: parseInt(response.data.balance),
        nonce: response.data.nonce,
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Get account transactions
   */
  async getTransactions(address, limit = 20, offset = 0) {
    try {
      const response = await this.client.get(
        `/v2/accounts/${address}/transactions?limit=${limit}&offset=${offset}`
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw error;
    }
  }

  /**
   * Broadcast transaction
   */
  async broadcastTransaction(txHex) {
    try {
      const response = await this.client.post('/v2/transactions', {
        tx: txHex,
      });
      return {
        txid: response.data.txid,
        status: 'submitted',
      };
    } catch (error) {
      console.error('Failed to broadcast transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txId) {
    try {
      const response = await this.client.get(`/v2/transactions/${txId}`);
      return {
        txid: response.data.tx_id,
        status: response.data.tx_status,
        blockHeight: response.data.block_height,
        fee: response.data.fee_rate,
      };
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw error;
    }
  }

  /**
   * Get contract info
   */
  async getContractInfo(contractId) {
    try {
      const response = await this.client.get(
        `/v2/contracts/source/${contractId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get contract info:', error);
      throw error;
    }
  }

  /**
   * Get contract ABI
   */
  async getContractAbi(contractId) {
    try {
      const response = await this.client.get(
        `/v2/contracts/interface/${contractId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get contract ABI:', error);
      throw error;
    }
  }

  /**
   * Call read-only contract function
   */
  async callReadOnlyFunction(contractId, functionName, args = []) {
    try {
      const response = await this.client.post(
        `/v2/contracts/call-read/${contractId}/${functionName}`,
        { arguments: args }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to call read-only function:', error);
      throw error;
    }
  }

  /**
   * Get network info
   */
  async getNetworkInfo() {
    try {
      const response = await this.client.get('/v2/info');
      return {
        networkVersion: response.data.network_version,
        chainId: response.data.chain_id,
        serverVersion: response.data.server_version,
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }
}

/**
 * Event Bus for application-wide event handling
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to event
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Subscribe to event once
   */
  once(eventName, callback) {
    const handler = (data) => {
      callback(data);
      this.off(eventName, handler);
    };
    this.on(eventName, handler);
  }

  /**
   * Unsubscribe from event
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }

  /**
   * Emit event
   */
  emit(eventName, data = null) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(callback => callback(data));
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = {};
  }

  /**
   * Get subscribers count for event
   */
  listenerCount(eventName) {
    return this.events[eventName]?.length || 0;
  }
}

// Create global instances
const apiService = new StacksApiService();
const eventBus = new EventBus();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HttpClient,
    StacksApiService,
    EventBus,
    apiService,
    eventBus,
  };
}
