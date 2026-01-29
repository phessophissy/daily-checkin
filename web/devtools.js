/**
 * Development Tools and Utilities
 * Tools for development and debugging
 */

class DevTools {
  constructor() {
    this.enabled = true;
    this.logs = [];
    this.maxLogs = 1000;
  }

  /**
   * Enable dev tools
   */
  enable() {
    this.enabled = true;
    this.exposeGlobals();
    console.log('🔧 Dev tools enabled');
  }

  /**
   * Disable dev tools
   */
  disable() {
    this.enabled = false;
    console.log('🔧 Dev tools disabled');
  }

  /**
   * Expose globals for debugging
   */
  exposeGlobals() {
    if (typeof window !== 'undefined') {
      window.$devTools = this;
      window.$state = appState;
      window.$cache = cache;
      window.$api = apiService;
      window.$logger = logger;
      window.$router = router;
      window.$i18n = i18n;
    }
  }

  /**
   * Log message
   */
  log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data,
      level: 'log',
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.log(`[${timestamp}] ${message}`, data || '');
  }

  /**
   * Get all logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Export logs
   */
  exportLogs() {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `logs-${timestamp}.json`;
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Get app state snapshot
   */
  getStateSnapshot() {
    return appState.snapshot();
  }

  /**
   * Get cache contents
   */
  getCacheContents() {
    return {
      size: cache.size(),
      keys: cache.keys(),
    };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    return {
      uptime: performance.now(),
      memory: (performance.memory?.usedJSHeapSize || 0) / 1048576 + ' MB',
      metrics: performanceMonitor.getAllMetrics(),
    };
  }

  /**
   * Simulate network error
   */
  simulateNetworkError() {
    console.warn('⚠️ Simulating network error');
    eventBus.emit('network-error', { message: 'Simulated network error' });
  }

  /**
   * Simulate checkin success
   */
  simulateCheckinSuccess() {
    console.warn('⚠️ Simulating checkin success');
    appState.setState({
      user: {
        ...appState.state.user,
        totalCheckins: appState.state.user.totalCheckins + 1,
      },
    });
  }

  /**
   * Simulate transaction
   */
  simulateTransaction() {
    console.warn('⚠️ Simulating transaction');
    eventBus.emit('transaction-submitted', {
      txid: '0x' + Math.random().toString(16).substr(2),
    });
  }

  /**
   * Print system info
   */
  printSystemInfo() {
    console.log(`
📊 System Information:
- App: ${DailyCheckinConfig.app?.title} v${DailyCheckinConfig.app?.version}
- Network: ${DailyCheckinConfig.network?.name}
- Contract: ${DailyCheckinConfig.contract?.name}
- Theme: ${themeManager.currentTheme}
- Language: ${i18n.currentLanguage}
- State: ${Object.keys(appState.state).length} properties
- Cache: ${cache.size()} items
    `);
  }

  /**
   * Reload state
   */
  reloadState() {
    const saved = localStorage.getItem('dailycheckin_data');
    if (saved) {
      appState.setState(JSON.parse(saved));
      console.log('✅ State reloaded from storage');
    }
  }
}

/**
 * Performance Profiler
 */

class PerformanceProfiler {
  constructor() {
    this.profiles = new Map();
  }

  /**
   * Start profile
   */
  start(name) {
    this.profiles.set(name, {
      startTime: performance.now(),
      startMemory: performance.memory?.usedJSHeapSize || 0,
    });
  }

  /**
   * End profile
   */
  end(name) {
    const profile = this.profiles.get(name);
    if (!profile) return null;

    const endTime = performance.now();
    const endMemory = performance.memory?.usedJSHeapSize || 0;

    const result = {
      name,
      duration: endTime - profile.startTime,
      memoryDelta: (endMemory - profile.startMemory) / 1024 / 1024, // MB
    };

    this.profiles.delete(name);
    return result;
  }

  /**
   * Get all profiles
   */
  getProfiles() {
    return Array.from(this.profiles.entries());
  }

  /**
   * Print profile
   */
  printProfile(result) {
    console.log(`
⏱️  Profile: ${result.name}
   Duration: ${result.duration.toFixed(2)}ms
   Memory: ${result.memoryDelta.toFixed(2)}MB
    `);
  }
}

/**
 * API Mock Server
 * Mock API responses for testing
 */

class ApiMockServer {
  constructor() {
    this.mocks = new Map();
    this.enabled = false;
  }

  /**
   * Enable mock server
   */
   enable() {
    this.enabled = true;
    console.log('🎭 Mock API server enabled');
  }

  /**
   * Disable mock server
   */
  disable() {
    this.enabled = false;
    console.log('🎭 Mock API server disabled');
  }

  /**
   * Add mock response
   */
  addMock(endpoint, response) {
    this.mocks.set(endpoint, response);
  }

  /**
   * Get mock response
   */
  getMockResponse(endpoint) {
    return this.mocks.get(endpoint);
  }

  /**
   * Setup common mocks
   */
  setupCommonMocks() {
    this.addMock('/v2/accounts/address/balances', {
      balance: '1000000',
      nonce: 0,
    });

    this.addMock('/v2/transactions', {
      txid: '0x' + Math.random().toString(16).substr(2),
      status: 'submitted',
    });

    this.addMock('/v2/info', {
      network_version: 'testnet',
      chain_id: 'testnet',
      server_version: '1.0.0',
    });
  }

  /**
   * Clear all mocks
   */
  clearMocks() {
    this.mocks.clear();
  }
}

// Create global instances
const devTools = typeof window !== 'undefined' ? new DevTools() : null;
const profiler = typeof window !== 'undefined' ? new PerformanceProfiler() : null;
const mockApiServer = typeof window !== 'undefined' ? new ApiMockServer() : null;

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DevTools,
    PerformanceProfiler,
    ApiMockServer,
    devTools,
    profiler,
    mockApiServer,
  };
}

// Auto-expose in browser if debug enabled
if (typeof window !== 'undefined' && DailyCheckinConfig?.features?.debugMode) {
  devTools?.enable();
}
