/**
 * Localization and Internationalization (i18n)
 * Handles multi-language support
 */

const i18n = {
  // English translations
  en: {
    app: {
      title: 'Daily Checkin',
      description: 'Earn rewards by checking in daily on the Stacks blockchain',
      subtitle: 'Secure Daily Check-in System',
    },
    wallet: {
      connect: 'Connect Wallet',
      disconnect: 'Disconnect',
      connected: 'Wallet Connected',
      connecting: 'Connecting...',
      notConnected: 'Wallet Not Connected',
      address: 'Connected Address',
      network: 'Network',
      balance: 'Balance',
    },
    checkin: {
      title: 'Daily Check-in',
      description: 'Check in once per day to maintain your streak',
      button: 'Check In Today',
      fee: 'Fee: 0.001 STX',
      feeExplanation: 'The fee goes to the contract deployer for maintenance',
      alreadyChecked: 'Already Checked In Today',
      success: 'Check-in successful!',
      failed: 'Check-in failed',
      pending: 'Check-in pending...',
    },
    stats: {
      totalCheckins: 'Total Check-ins',
      consecutiveDays: 'Consecutive Days',
      stxEarned: 'STX Earned',
      lastCheckin: 'Last Check-in',
    },
    features: {
      secure: 'Secure & Decentralized',
      blockchain: 'Stacks Blockchain',
      rewards: 'Reward System',
      ui: 'Premium UI',
      tracking: 'Track Progress',
      fast: 'Fast Transactions',
    },
    errors: {
      walletConnection: 'Failed to connect wallet',
      walletDisconnection: 'Failed to disconnect wallet',
      networkError: 'Network error',
      transactionFailed: 'Transaction failed',
      timeout: 'Operation timeout',
      invalidAddress: 'Invalid wallet address',
      insufficientBalance: 'Insufficient balance',
    },
    success: {
      checkinComplete: 'Check-in completed successfully!',
      walletConnected: 'Wallet connected successfully!',
      walletDisconnected: 'Wallet disconnected',
    },
    buttons: {
      ok: 'OK',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      retry: 'Retry',
      continue: 'Continue',
    },
  },

  // Spanish translations
  es: {
    app: {
      title: 'Check-in Diario',
      description: 'Gana recompensas revisando diariamente en la blockchain de Stacks',
      subtitle: 'Sistema Seguro de Check-in Diario',
    },
    wallet: {
      connect: 'Conectar Monedero',
      disconnect: 'Desconectar',
      connected: 'Monedero Conectado',
      connecting: 'Conectando...',
      notConnected: 'Monedero No Conectado',
    },
    checkin: {
      title: 'Check-in Diario',
      description: 'Revisa una vez al día para mantener tu racha',
      button: 'Revisar Hoy',
      success: '¡Check-in exitoso!',
      failed: 'Check-in falló',
    },
  },

  // Current language
  currentLanguage: 'en',

  /**
   * Get translation
   */
  t(key, defaultValue = '') {
    const keys = key.split('.');
    let value = this[this.currentLanguage];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return defaultValue || key;
    }

    return value;
  },

  /**
   * Set language
   */
  setLanguage(lang) {
    if (this[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('dailycheckin_language', lang);
      this.notify('languageChanged', lang);
    }
  },

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return Object.keys(this).filter(k => k !== 'currentLanguage' && k !== 't' && k !== 'setLanguage');
  },

  /**
   * Add language
   */
  addLanguage(lang, translations) {
    this[lang] = translations;
  },

  /**
   * Format currency
   */
  formatCurrency(amount, symbol = 'STX') {
    return `${parseFloat(amount).toFixed(3)} ${symbol}`;
  },

  /**
   * Format date
   */
  formatDate(date, lang = this.currentLanguage) {
    const options = {
      en: { year: 'numeric', month: 'long', day: 'numeric' },
      es: { year: 'numeric', month: 'long', day: 'numeric' },
    };

    return new Date(date).toLocaleDateString(lang, options[lang]);
  },
};

// Export localization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { i18n };
}
