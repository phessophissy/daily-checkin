/**
 * Daily Checkin Configuration
 * All configuration constants for the application
 */

const DailyCheckinConfig = {
  // Stacks Network Configuration
  network: {
    name: 'testnet',
    url: 'https://stacks-testnet-api.herokuapp.com',
    nodeUrl: 'http://localhost:3999',
    chainId: 'testnet',
  },

  // Contract Configuration
  contract: {
    deployer: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
    name: 'daily-checkin',
    address: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.daily-checkin',
  },

  // Fee Configuration
  fee: {
    amount: 0.001, // in STX
    amountMicroStx: 1000, // in microSTX
    description: '0.001 STX fee for daily check-in',
  },

  // Wallet Configuration
  wallet: {
    connectTimeout: 30000, // 30 seconds
    requiredNetwork: 'testnet',
    supportedWallets: ['hiro', 'xverse'],
  },

  // Feature Flags
  features: {
    enableNotifications: true,
    enableTransactionHistory: true,
    enableStatistics: true,
    enableStreaks: true,
    debugMode: false,
  },

  // UI Configuration
  ui: {
    theme: 'metallic',
    animationsEnabled: true,
    toastDuration: 5000, // 5 seconds
    modalAnimationDuration: 300, // 300ms
  },

  // Storage Configuration
  storage: {
    prefix: 'dailycheckin_',
    dataKey: 'data',
    walletKey: 'wallet',
    connectedKey: 'connected',
    transactionsKey: 'transactions',
  },

  // API Endpoints
  api: {
    getBalance: '/v2/accounts/:address/balances',
    getTransactions: '/v2/accounts/:address/transactions',
    broadcastTransaction: '/v2/transactions',
    getTransaction: '/v2/transactions/:txId',
    getContractInfo: '/v2/contracts/:contractId',
  },

  // Constants
  constants: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    maxTransactionWait: 120000, // 2 minutes
    sessionTimeout: 3600000, // 1 hour
  },

  // Messages
  messages: {
    walletConnected: 'Wallet connected successfully!',
    walletDisconnected: 'Wallet disconnected',
    checkinSuccess: 'Check-in successful! 0.001 STX fee processed.',
    checkinAlreadyDone: 'You have already checked in today. Come back tomorrow!',
    checkinFailed: 'Check-in failed. Please try again.',
    connectionFailed: 'Failed to connect wallet. Please try again.',
    disconnectionFailed: 'Failed to disconnect wallet.',
    transactionBroadcasted: 'Transaction broadcasted. Waiting for confirmation...',
    transactionConfirmed: 'Transaction confirmed on blockchain!',
  },
};

// Color Palette
const MetallicColors = {
  gold: '#d4af37',
  silver: '#c0c0c0',
  darkSilver: '#b0b0b0',
  platinum: '#e5e4e2',
  copper: '#b87333',
  rosegold: '#b76e79',
  chrome: '#a9a9a9',
  darkBg: '#0d0d0d',
  mediumBg: '#1a1a1a',
  lightBg: '#2d2d2d',
  textPrimary: '#e8e8e8',
  textSecondary: '#b0b0b0',
  textTertiary: '#808080',
};

// Animations
const Animations = {
  fadeIn: 'fadeIn 0.6s ease-out',
  fadeOut: 'fadeOut 0.6s ease-out',
  slideInLeft: 'slideLeft 0.6s ease-out',
  slideInRight: 'slideRight 0.6s ease-out',
  scaleIn: 'scaleIn 0.6s ease-out',
  pulse: 'pulse 2s ease-in-out infinite',
  shimmer: 'shimmer 2s infinite',
  glow: 'glowPulse 2s infinite',
};

// Breakpoints for responsive design
const Breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1440,
};

// Helper function to get configuration
function getConfig(path, defaultValue = null) {
  const keys = path.split('.');
  let value = DailyCheckinConfig;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return defaultValue;
  }

  return value;
}

// Helper function to get color
function getColor(colorName) {
  return MetallicColors[colorName] || '#d4af37';
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DailyCheckinConfig,
    MetallicColors,
    Animations,
    Breakpoints,
    getConfig,
    getColor,
  };
}
