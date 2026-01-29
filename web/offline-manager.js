/**
 * Offline Support Manager
 * Manages offline state, queue, and sync
 */

class OfflineManager {
  constructor(config = {}) {
    this.isOnline = navigator.onLine || true;
    this.queue = [];
    this.syncInProgress = false;
    this.config = {
      maxQueueSize: config.maxQueueSize || 100,
      autoSync: config.autoSync !== false,
      syncInterval: config.syncInterval || 30000,
      persistQueue: config.persistQueue !== false,
      ...config
    };

    this.listeners = [];
    this.setupListeners();

    if (this.config.persistQueue) {
      this.loadQueue();
    }

    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  /**
   * Setup online/offline listeners
   */
  setupListeners() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Handle going online
   */
  handleOnline() {
    console.log('📡 Going online');
    this.isOnline = true;
    this.notifyListeners('online');
    if (this.config.autoSync && this.queue.length > 0) {
      this.syncQueue();
    }
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    console.log('📡 Going offline');
    this.isOnline = false;
    this.notifyListeners('offline');
  }

  /**
   * Add action to queue
   */
  queueAction(action) {
    if (this.queue.length >= this.config.maxQueueSize) {
      console.warn('Queue size limit reached');
      return false;
    }

    const queuedAction = {
      id: Date.now() + Math.random(),
      type: action.type,
      data: action.data,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: action.maxRetries || 3,
    };

    this.queue.push(queuedAction);
    this.persistQueue();
    this.notifyListeners('action-queued', queuedAction);

    console.log(`📦 Action queued: ${action.type} (${this.queue.length} in queue)`);
    return true;
  }

  /**
   * Sync queue when online
   */
  async syncQueue() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Syncing ${this.queue.length} queued actions`);

    const failedActions = [];

    for (const action of [...this.queue]) {
      try {
        await this.executeAction(action);
        this.removeFromQueue(action.id);
        this.notifyListeners('action-synced', action);
      } catch (error) {
        action.retries++;
        if (action.retries < action.maxRetries) {
          failedActions.push(action);
          this.notifyListeners('action-sync-failed', { action, error });
        } else {
          this.removeFromQueue(action.id);
          this.notifyListeners('action-sync-failed-permanent', { action, error });
        }
      }
    }

    this.syncInProgress = false;
    this.persistQueue();

    console.log(`✅ Sync complete. ${this.queue.length} remaining, ${failedActions.length} failed`);
  }

  /**
   * Execute action
   */
  async executeAction(action) {
    switch (action.type) {
      case 'checkin':
        return await this.performCheckin(action.data);
      case 'update-profile':
        return await this.updateProfile(action.data);
      case 'transaction':
        return await this.broadcastTransaction(action.data);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Perform check-in
   */
  async performCheckin(data) {
    const response = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Checkin failed');
    return response.json();
  }

  /**
   * Update profile
   */
  async updateProfile(data) {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Profile update failed');
    return response.json();
  }

  /**
   * Broadcast transaction
   */
  async broadcastTransaction(data) {
    const response = await fetch('/api/transactions/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Transaction broadcast failed');
    return response.json();
  }

  /**
   * Start auto-sync interval
   */
  startAutoSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.syncQueue();
      }
    }, this.config.syncInterval);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync() {
    clearInterval(this.syncInterval);
  }

  /**
   * Remove from queue
   */
  removeFromQueue(id) {
    const index = this.queue.findIndex(a => a.id === id);
    if (index > -1) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * Persist queue to storage
   */
  persistQueue() {
    if (this.config.persistQueue) {
      localStorage.setItem('offline_queue', JSON.stringify(this.queue));
    }
  }

  /**
   * Load queue from storage
   */
  loadQueue() {
    try {
      const stored = localStorage.getItem('offline_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`📦 Loaded ${this.queue.length} queued actions from storage`);
      }
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  }

  /**
   * Clear queue
   */
  clearQueue() {
    this.queue = [];
    this.persistQueue();
  }

  /**
   * Get queue stats
   */
  getQueueStats() {
    return {
      total: this.queue.length,
      checkins: this.queue.filter(a => a.type === 'checkin').length,
      updates: this.queue.filter(a => a.type === 'update-profile').length,
      transactions: this.queue.filter(a => a.type === 'transaction').length,
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Add listener
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => callback({ event, data }));
  }

  /**
   * Destroy
   */
  destroy() {
    this.stopAutoSync();
    window.removeEventListener('online', () => this.handleOnline());
    window.removeEventListener('offline', () => this.handleOffline());
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OfflineManager;
}
