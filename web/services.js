/**
 * Data Service
 * Manages data fetching, caching, and synchronization
 */

class DataService {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 60000; // 1 minute default
    this.syncInterval = options.syncInterval || 30000; // 30 seconds
    this.observers = new Map();
    this.syncing = new Set();
  }

  /**
   * Fetch data with caching
   */
  async fetch(key, fetcher, options = {}) {
    // Check cache first
    const cached = this.getFromCache(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetcher();
      this.setCache(key, data, options.ttl);
      this.notifyObservers(key, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get from cache
   */
  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set cache
   */
  setCache(key, data, ttl = null) {
    const expiresAt = Date.now() + (ttl || this.ttl);
    this.cache.set(key, {
      data,
      expiresAt,
    });
  }

  /**
   * Subscribe to data changes
   */
  subscribe(key, callback) {
    if (!this.observers.has(key)) {
      this.observers.set(key, []);
    }
    this.observers.get(key).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.observers.get(key);
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    };
  }

  /**
   * Notify observers
   */
  notifyObservers(key, data) {
    const callbacks = this.observers.get(key) || [];
    callbacks.forEach(callback => callback(data));
  }

  /**
   * Invalidate cache
   */
  invalidate(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }
}

/**
 * Checkin Service
 * Handles all check-in related operations
 */

class CheckinService {
  constructor(api, contract) {
    this.api = api;
    this.contract = contract;
    this.checkinHistory = [];
  }

  /**
   * Get user checkin data
   */
  async getCheckinData(userAddress) {
    try {
      const data = await this.api.callReadOnlyFunction(
        this.contract,
        'get-user-checkins',
        [userAddress]
      );
      return data;
    } catch (error) {
      console.error('Failed to get checkin data:', error);
      throw error;
    }
  }

  /**
   * Perform checkin
   */
  async performCheckin(userAddress, transaction) {
    try {
      const result = await this.api.broadcastTransaction(transaction);
      this.checkinHistory.push({
        userAddress,
        timestamp: new Date().toISOString(),
        txid: result.txid,
        status: 'submitted',
      });
      return result;
    } catch (error) {
      console.error('Checkin failed:', error);
      throw error;
    }
  }

  /**
   * Get checkin history
   */
  getHistory(userAddress) {
    return this.checkinHistory.filter(h => h.userAddress === userAddress);
  }

  /**
   * Get consecutive days
   */
  async getConsecutiveDays(userAddress) {
    try {
      const data = await this.getCheckinData(userAddress);
      return data.consecutiveDays || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get total checkins
   */
  async getTotalCheckins(userAddress) {
    try {
      const data = await this.getCheckinData(userAddress);
      return data.totalCheckins || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get STX earned
   */
  async getStxEarned(userAddress) {
    try {
      const data = await this.getCheckinData(userAddress);
      return (data.stxEarned || 0) / 1000000; // Convert from microSTX
    } catch {
      return 0;
    }
  }
}

/**
 * Wallet Service
 * Manages wallet-related operations
 */

class WalletService {
  constructor(integration) {
    this.integration = integration;
    this.currentAddress = null;
    this.networkInfo = null;
  }

  /**
   * Connect wallet
   */
  async connect() {
    try {
      const result = await this.integration.connectWallet();
      this.currentAddress = result.userAddress;
      this.networkInfo = await this.integration.getNetworkInfo();
      return {
        address: this.currentAddress,
        network: this.networkInfo,
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect() {
    try {
      await this.integration.disconnectWallet();
      this.currentAddress = null;
      this.networkInfo = null;
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Get current address
   */
  getAddress() {
    return this.currentAddress;
  }

  /**
   * Get network info
   */
  getNetworkInfo() {
    return this.networkInfo;
  }

  /**
   * Is connected
   */
  isConnected() {
    return this.currentAddress !== null;
  }

  /**
   * Switch network
   */
  async switchNetwork(networkName) {
    // Implementation depends on wallet
    console.log(`Switching to ${networkName}`);
  }

  /**
   * Get balance
   */
  async getBalance(address) {
    try {
      // This would call the actual balance endpoint
      return 0;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }
}

/**
 * Transaction Service
 * Manages transaction creation and monitoring
 */

class TransactionService {
  constructor(api) {
    this.api = api;
    this.transactions = new Map();
  }

  /**
   * Create transaction
   */
  createTransaction(options) {
    const tx = {
      id: Date.now().toString(),
      ...options,
      createdAt: new Date().toISOString(),
      status: 'created',
    };

    this.transactions.set(tx.id, tx);
    return tx;
  }

  /**
   * Broadcast transaction
   */
  async broadcast(tx) {
    try {
      const result = await this.api.broadcastTransaction(tx.hex);
      const transaction = this.transactions.get(tx.id);
      if (transaction) {
        transaction.txid = result.txid;
        transaction.status = 'submitted';
        transaction.submittedAt = new Date().toISOString();
      }
      return result;
    } catch (error) {
      const transaction = this.transactions.get(tx.id);
      if (transaction) {
        transaction.status = 'failed';
        transaction.error = error.message;
      }
      throw error;
    }
  }

  /**
   * Monitor transaction
   */
  async monitor(txid, timeout = 120000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await this.api.getTransaction(txid);

        if (result.status === 'success' || result.status === 'confirmed') {
          return {
            status: 'confirmed',
            blockHeight: result.blockHeight,
            fee: result.fee,
          };
        }

        if (result.status === 'failed' || result.status === 'error') {
          return {
            status: 'failed',
            error: 'Transaction failed',
          };
        }
      } catch (error) {
        console.error('Monitor error:', error);
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return {
      status: 'pending',
      message: 'Transaction confirmation timeout',
    };
  }

  /**
   * Get transaction
   */
  getTransaction(id) {
    return this.transactions.get(id);
  }

  /**
   * Get all transactions
   */
  getAllTransactions() {
    return Array.from(this.transactions.values());
  }

  /**
   * Get recent transactions
   */
  getRecentTransactions(limit = 10) {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
}

// Export services
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataService,
    CheckinService,
    WalletService,
    TransactionService,
  };
}
