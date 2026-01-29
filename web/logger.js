/**
 * Advanced Logging Service
 * Structured logging with levels, formatting, and filtering
 */

class Logger {
  constructor(name, config = {}) {
    this.name = name;
    this.config = {
      level: config.level || 'info',
      format: config.format || 'text',
      enableConsole: config.enableConsole !== false,
      enableFile: config.enableFile || false,
      enableRemote: config.enableRemote || false,
      ...config
    };

    this.levels = {
      'debug': 0,
      'info': 1,
      'warn': 2,
      'error': 3
    };

    this.logs = [];
    this.filters = [];
  }

  /**
   * Log message
   */
  log(level, message, data = null) {
    if (this.levels[level] < this.levels[this.config.level]) {
      return;
    }

    // Check filters
    if (!this.passFilters(level, message, data)) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context: this.name,
      source: new Error().stack.split('\n')[2]
    };

    this.logs.push(logEntry);

    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    if (this.config.enableFile) {
      this.logToFile(logEntry);
    }

    if (this.config.enableRemote) {
      this.sendToRemote(logEntry);
    }
  }

  /**
   * Check filters
   */
  passFilters(level, message, data) {
    return this.filters.every(filter => filter(level, message, data));
  }

  /**
   * Add filter
   */
  addFilter(filter) {
    this.filters.push(filter);
  }

  /**
   * Remove filter
   */
  removeFilter(filter) {
    const index = this.filters.indexOf(filter);
    if (index > -1) {
      this.filters.splice(index, 1);
    }
  }

  /**
   * Log to console
   */
  logToConsole(entry) {
    const { timestamp, level, message, data, context } = entry;
    const prefix = `[${timestamp}] [${context}] [${level.toUpperCase()}]`;

    const style = {
      'debug': 'color: #888',
      'info': 'color: #0066cc',
      'warn': 'color: #ff9900',
      'error': 'color: #cc0000'
    };

    console.log(`%c${prefix}`, style[level], message, data || '');
  }

  /**
   * Log to file (IndexedDB)
   */
  async logToFile(entry) {
    try {
      const db = await this.getDatabase();
      const tx = db.transaction(['logs'], 'readwrite');
      const store = tx.objectStore('logs');
      await store.add(entry);
    } catch (error) {
      console.error('Failed to log to file:', error);
    }
  }

  /**
   * Get database
   */
  async getDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('logger-db', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Send to remote
   */
  async sendToRemote(entry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Failed to send logs to remote:', error);
    }
  }

  /**
   * Log methods
   */
  debug(message, data) { this.log('debug', message, data); }
  info(message, data) { this.log('info', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  error(message, data) { this.log('error', message, data); }

  /**
   * Get logs
   */
  getLogs(level = null, limit = 100) {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    return filtered.slice(-limit);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs
   */
  exportLogs(format = 'json') {
    const logs = this.logs;

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'context'];
      const rows = logs.map(log => [
        log.timestamp,
        log.level,
        log.message,
        log.context
      ]);

      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    }

    return logs.map(log =>
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');
  }

  /**
   * Download logs
   */
  downloadLogs(format = 'json') {
    const content = this.exportLogs(format);
    const ext = format === 'csv' ? 'csv' : 'json';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

/**
 * Global Logger Instance
 */
const logger = new Logger('App', {
  level: 'info',
  enableConsole: true,
  enableFile: true
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Logger,
    logger
  };
}
