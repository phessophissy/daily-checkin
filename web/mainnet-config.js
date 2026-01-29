/**
 * Mainnet Configuration
 * Production environment setup for Stacks Mainnet
 */

const mainnetConfig = {
  // Network configuration
  network: {
    name: 'mainnet',
    chainId: 1,
    apiUrl: 'https://stacks-api.blockstack.org',
    broadcastUrl: 'https://stacks-api.blockstack.org/v2/transactions',
    explorerUrl: 'https://explorer.stacks.co'
  },

  // Contract configuration
  contract: {
    deployer: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
    name: 'daily-checkin',
    address: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.daily-checkin'
  },

  // Transaction configuration
  transaction: {
    fee: 1000, // microSTX (0.001 STX)
    confirmationWait: 30, // blocks
    maxAttempts: 3,
    retryDelay: 5000 // ms
  },

  // Wallet configuration
  wallet: {
    appName: 'Daily Check-in',
    appIcon: 'https://daily-checkin.app/icon-512.png',
    redirectTo: 'https://daily-checkin.app'
  },

  // Analytics & Monitoring
  monitoring: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    sentry: {
      dsn: process.env.SENTRY_DSN || '',
      environment: 'mainnet',
      tracesSampleRate: 0.1
    }
  },

  // Feature flags
  features: {
    enableOfflineMode: true,
    enableNotifications: true,
    enableAnalytics: true,
    enableDarkTheme: true,
    enableMultiLanguage: true
  },

  // API rate limiting
  rateLimiting: {
    maxRequests: 100,
    timeWindow: 60000 // 1 minute
  },

  // Cache configuration
  cache: {
    strategy: 'stale-while-revalidate',
    ttl: 300000, // 5 minutes
    maxSize: 1000 // entries
  }
};

// Export configuration
export default mainnetConfig;

// Alternative: CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = mainnetConfig;
}
