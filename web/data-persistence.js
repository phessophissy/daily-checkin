/**
 * Data Persistence Layer
 * Local storage with IndexedDB support
 */

class DataStore {
  constructor(name = 'app-store') {
    this.name = name;
    this.db = null;
    this.ready = this.init();
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Get data
   */
  async get(key) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value);
    });
  }

  /**
   * Set data
   */
  async set(key, value, ttl = null) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['data', 'metadata'], 'readwrite');
      const store = transaction.objectStore('data');
      const metaStore = transaction.objectStore('metadata');

      const request = store.put({ id: key, value });
      request.onerror = () => reject(request.error);

      if (ttl) {
        const expiresAt = Date.now() + ttl;
        metaStore.put({ key, expiresAt });

        setTimeout(() => this.delete(key), ttl);
      }

      request.onsuccess = () => resolve(true);
    });
  }

  /**
   * Delete data
   */
  async delete(key) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['data', 'metadata'], 'readwrite');
      const store = transaction.objectStore('data');
      const metaStore = transaction.objectStore('metadata');

      const request = store.delete(key);
      request.onerror = () => reject(request.error);

      metaStore.delete(key);
      request.onsuccess = () => resolve(true);
    });
  }

  /**
   * Clear all data
   */
  async clear() {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['data', 'metadata'], 'readwrite');
      const store = transaction.objectStore('data');
      const metaStore = transaction.objectStore('metadata');

      const request = store.clear();
      request.onerror = () => reject(request.error);

      metaStore.clear();
      request.onsuccess = () => resolve(true);
    });
  }

  /**
   * Get all keys
   */
  async keys() {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get size
   */
  async size() {
    const keys = await this.keys();
    return keys.length;
  }
}

/**
 * Sync Manager
 */
class SyncManager {
  constructor(dataStore, apiClient) {
    this.dataStore = dataStore;
    this.apiClient = apiClient;
    this.syncQueue = [];
    this.syncing = false;
  }

  /**
   * Add sync task
   */
  async addSyncTask(key, data, endpoint) {
    this.syncQueue.push({
      key,
      data,
      endpoint,
      timestamp: Date.now(),
      retries: 0
    });

    await this.sync();
  }

  /**
   * Sync with server
   */
  async sync() {
    if (this.syncing || this.syncQueue.length === 0) return;

    this.syncing = true;

    for (const task of [...this.syncQueue]) {
      try {
        await this.apiClient.post(task.endpoint, task.data);
        this.syncQueue = this.syncQueue.filter(t => t.key !== task.key);
        await this.dataStore.delete(task.key);
      } catch (error) {
        task.retries++;
        if (task.retries >= 3) {
          this.syncQueue = this.syncQueue.filter(t => t.key !== task.key);
        }
      }
    }

    this.syncing = false;
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      queued: this.syncQueue.length,
      syncing: this.syncing
    };
  }
}

/**
 * Backup Manager
 */
class BackupManager {
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  /**
   * Create backup
   */
  async backup() {
    const keys = await this.dataStore.keys();
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {}
    };

    for (const key of keys) {
      backup.data[key] = await this.dataStore.get(key);
    }

    return backup;
  }

  /**
   * Restore from backup
   */
  async restore(backup) {
    await this.dataStore.clear();

    for (const [key, value] of Object.entries(backup.data)) {
      await this.dataStore.set(key, value);
    }
  }

  /**
   * Export backup
   */
  async exportBackup() {
    const backup = await this.backup();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import backup
   */
  async importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          await this.restore(backup);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataStore,
    SyncManager,
    BackupManager
  };
}
