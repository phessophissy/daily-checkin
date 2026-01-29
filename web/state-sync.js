/**
 * State Synchronization
 * Sync state across multiple tabs/windows
 */

class StateSync {
  constructor(storageName = 'app-state-sync') {
    this.storageName = storageName;
    this.state = {};
    this.listeners = [];
    this.setupListener();
  }

  /**
   * Setup storage listener
   */
  setupListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageName && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          this.state = newState;
          this.notifyListeners(newState);
        } catch (error) {
          console.error('Failed to parse synced state:', error);
        }
      }
    });
  }

  /**
   * Set state
   */
  setState(newState) {
    this.state = newState;
    localStorage.setItem(this.storageName, JSON.stringify(newState));
    this.notifyListeners(newState);
  }

  /**
   * Update state
   */
  updateState(updates) {
    const newState = { ...this.state, ...updates };
    this.setState(newState);
  }

  /**
   * Get state
   */
  getState() {
    return this.state;
  }

  /**
   * Load from storage
   */
  load() {
    try {
      const stored = localStorage.getItem(this.storageName);
      if (stored) {
        this.state = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
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
  notifyListeners(newState) {
    this.listeners.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        console.error('State listener error:', error);
      }
    });
  }

  /**
   * Clear state
   */
  clear() {
    this.state = {};
    localStorage.removeItem(this.storageName);
  }
}

/**
 * Cross-Tab Communication
 */
class CrossTabMessaging {
  constructor(channelName = 'app-channel') {
    this.channelName = channelName;
    this.channel = new BroadcastChannel(channelName);
    this.messageHandlers = new Map();
    this.setupListener();
  }

  /**
   * Setup message listener
   */
  setupListener() {
    this.channel.onmessage = (e) => {
      const { type, data } = e.data;
      const handlers = this.messageHandlers.get(type) || [];
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Message handler error:', error);
        }
      });
    };
  }

  /**
   * Send message
   */
  sendMessage(type, data) {
    this.channel.postMessage({ type, data });
  }

  /**
   * Register message handler
   */
  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  /**
   * Unregister message handler
   */
  off(type, handler) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Close channel
   */
  close() {
    this.channel.close();
  }
}

/**
 * Service Worker Message Manager
 */
class ServiceWorkerMessenger {
  /**
   * Send message to service worker
   */
  static async postMessage(type, data) {
    if (!navigator.serviceWorker?.controller) {
      return null;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (e) => resolve(e.data);

      navigator.serviceWorker.controller.postMessage(
        { type, data, port: channel.port2 },
        [channel.port2]
      );
    });
  }

  /**
   * Listen for messages from service worker
   */
  static setupListener() {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.addEventListener('message', (e) => {
      const { type, data } = e.data;
      window.dispatchEvent(new CustomEvent(`sw-message-${type}`, { detail: data }));
    });
  }

  /**
   * Send and wait for response
   */
  static async request(type, data, timeout = 5000) {
    const response = this.postMessage(type, data);

    return Promise.race([
      response,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SW request timeout')), timeout)
      )
    ]);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StateSync,
    CrossTabMessaging,
    ServiceWorkerMessenger
  };
}
