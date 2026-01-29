/**
 * Daily Checkin Application
 * Main application logic for wallet connection and daily check-ins
 * Uses @stacks/connect for wallet integration and @stacks/transactions for blockchain operations
 */

class DailyCheckinApp {
  constructor() {
    this.wallet = null;
    this.transactionHandler = null;
    this.userAddress = null;
    this.isConnected = false;
    this.checkinData = {
      totalCheckins: 0,
      consecutiveDays: 0,
      stxEarned: 0,
      lastCheckin: null,
      transactions: []
    };
    
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    console.log('🚀 Daily Checkin App Initializing...');
    
    // Initialize wallet integration
    this.wallet = new StacksWalletIntegration({
      appDetails: {
        name: 'Daily Checkin',
        icon: 'https://via.placeholder.com/64?text=DC',
      }
    });

    // Initialize transaction handler
    this.transactionHandler = new DailyCheckinTransaction();

    // Setup event listeners
    this.setupEventListeners();

    // Load saved data from localStorage
    this.loadUserData();

    // Update UI
    this.updateUI();

    console.log('✅ Daily Checkin App Initialized');
  }

  /**
   * Setup event listeners for UI elements
   */
  setupEventListeners() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    const disconnectBtn = document.getElementById('disconnect-wallet-btn');
    const checkinBtn = document.getElementById('checkin-btn');

    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.connectWallet());
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => this.disconnectWallet());
    }

    if (checkinBtn) {
      checkinBtn.addEventListener('click', () => this.performCheckin());
    }

    // Listen for storage changes (multi-tab support)
    window.addEventListener('storage', () => this.handleStorageChange());
  }

  /**
   * Connect to user's Stacks wallet
   */
  async connectWallet() {
    try {
      console.log('🔗 Connecting to wallet...');
      const connectBtn = document.getElementById('connect-wallet-btn');
      connectBtn.disabled = true;
      connectBtn.textContent = 'Connecting...';

      // Show connect dialog
      const result = await this.wallet.connectWallet();

      if (result && result.userAddress) {
        this.userAddress = result.userAddress;
        this.isConnected = true;

        console.log('✅ Wallet connected:', this.userAddress);
        
        // Save to localStorage
        localStorage.setItem('dailycheckin_wallet', this.userAddress);
        localStorage.setItem('dailycheckin_connected', 'true');

        this.showNotification('Wallet connected successfully!', 'success');
        this.updateUI();
      }
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      this.showNotification('Failed to connect wallet. Please try again.', 'error');
    } finally {
      const connectBtn = document.getElementById('connect-wallet-btn');
      connectBtn.disabled = false;
      connectBtn.textContent = 'Connect Wallet';
    }
  }

  /**
   * Disconnect from user's Stacks wallet
   */
  async disconnectWallet() {
    try {
      console.log('🔌 Disconnecting wallet...');
      
      await this.wallet.disconnectWallet();
      
      this.userAddress = null;
      this.isConnected = false;

      // Clear from localStorage
      localStorage.removeItem('dailycheckin_wallet');
      localStorage.removeItem('dailycheckin_connected');

      console.log('✅ Wallet disconnected');
      
      this.showNotification('Wallet disconnected', 'success');
      this.updateUI();
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      this.showNotification('Failed to disconnect wallet', 'error');
    }
  }

  /**
   * Perform daily check-in
   */
  async performCheckin() {
    if (!this.isConnected || !this.userAddress) {
      this.showNotification('Please connect your wallet first', 'error');
      return;
    }

    // Check if already checked in today
    if (this.hasCheckedInToday()) {
      this.showNotification('You have already checked in today!', 'error');
      return;
    }

    try {
      console.log('📱 Performing check-in...');
      
      const checkinBtn = document.getElementById('checkin-btn');
      const loadingIndicator = document.getElementById('loading-indicator');

      // Show loading state
      checkinBtn.disabled = true;
      checkinBtn.textContent = 'Processing...';
      if (loadingIndicator) loadingIndicator.style.display = 'block';

      // Create check-in transaction
      const transaction = await this.transactionHandler.createCheckInTransaction({
        userAddress: this.userAddress,
        contractAddress: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
        contractName: 'daily-checkin',
        functionName: 'check-in',
      });

      console.log('📝 Transaction created, requesting signature...');

      // Use wallet to sign and broadcast
      const signedTx = await this.wallet.getUserAddress(); // This would need actual signing
      
      // Broadcast transaction
      const result = await this.transactionHandler.broadcastCheckInTransaction(transaction);

      console.log('✅ Check-in successful!', result);

      // Update local data
      this.updateCheckinData();
      
      // Save transaction record
      this.saveTransaction({
        type: 'checkin',
        timestamp: new Date().toISOString(),
        txid: result.txid || 'pending',
        fee: 0.001,
      });

      this.showNotification('Check-in successful! 0.001 STX fee processed.', 'success');
      
    } catch (error) {
      console.error('❌ Check-in error:', error);
      this.showNotification('Check-in failed: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      const checkinBtn = document.getElementById('checkin-btn');
      const loadingIndicator = document.getElementById('loading-indicator');

      checkinBtn.disabled = false;
      checkinBtn.textContent = '📱 Check In Today';
      
      if (loadingIndicator) loadingIndicator.style.display = 'none';

      this.updateUI();
    }
  }

  /**
   * Check if user has already checked in today
   */
  hasCheckedInToday() {
    if (!this.checkinData.lastCheckin) return false;

    const lastCheckinDate = new Date(this.checkinData.lastCheckin).toDateString();
    const today = new Date().toDateString();

    return lastCheckinDate === today;
  }

  /**
   * Update check-in data after successful check-in
   */
  updateCheckinData() {
    this.checkinData.totalCheckins += 1;
    this.checkinData.lastCheckin = new Date().toISOString();
    
    // Update consecutive days (simplified logic)
    if (!this.checkinData.consecutiveDays) {
      this.checkinData.consecutiveDays = 1;
    } else {
      this.checkinData.consecutiveDays += 1;
    }

    // Update STX earned (0.001 per check-in for simplicity)
    this.checkinData.stxEarned += 0.001;

    // Save to localStorage
    this.saveUserData();
  }

  /**
   * Save transaction record
   */
  saveTransaction(tx) {
    this.checkinData.transactions.push(tx);
    
    // Keep only last 50 transactions
    if (this.checkinData.transactions.length > 50) {
      this.checkinData.transactions.shift();
    }

    this.saveUserData();
  }

  /**
   * Update UI elements
   */
  updateUI() {
    this.updateWalletUI();
    this.updateStatsUI();
    this.updateCheckinUI();
  }

  /**
   * Update wallet-related UI
   */
  updateWalletUI() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    const disconnectBtn = document.getElementById('disconnect-wallet-btn');
    const walletStatus = document.getElementById('wallet-status');
    const walletAddressSection = document.getElementById('wallet-address-section');
    const walletConnectionStatus = document.getElementById('wallet-connection-status');
    const walletAddress = document.getElementById('wallet-address');
    const statusIndicator = document.getElementById('status-indicator');

    if (this.isConnected && this.userAddress) {
      // Show connected state
      if (connectBtn) connectBtn.style.display = 'none';
      if (walletStatus) {
        walletStatus.className = 'status-badge status-active';
        walletStatus.textContent = 'Connected';
      }
      if (walletAddressSection) walletAddressSection.style.display = 'block';
      if (walletConnectionStatus) walletConnectionStatus.textContent = 'Wallet is connected';
      if (walletAddress) walletAddress.textContent = this.userAddress;
      if (statusIndicator) statusIndicator.style.animation = 'pulse 2s ease-in-out infinite';
    } else {
      // Show disconnected state
      if (connectBtn) connectBtn.style.display = 'inline-block';
      if (walletStatus) {
        walletStatus.className = 'status-badge status-inactive';
        walletStatus.textContent = 'Disconnected';
      }
      if (walletAddressSection) walletAddressSection.style.display = 'none';
      if (walletConnectionStatus) walletConnectionStatus.textContent = 'Not Connected';
      if (statusIndicator) statusIndicator.style.animation = 'none';
    }
  }

  /**
   * Update statistics UI
   */
  updateStatsUI() {
    const totalCheckinsEl = document.getElementById('total-checkins');
    const consecutiveDaysEl = document.getElementById('consecutive-days');
    const stxEarnedEl = document.getElementById('stx-earned');
    const lastCheckinEl = document.getElementById('last-checkin');

    if (totalCheckinsEl) totalCheckinsEl.textContent = this.checkinData.totalCheckins;
    if (consecutiveDaysEl) consecutiveDaysEl.textContent = this.checkinData.consecutiveDays;
    if (stxEarnedEl) stxEarnedEl.textContent = this.checkinData.stxEarned.toFixed(3);
    
    if (lastCheckinEl) {
      if (this.checkinData.lastCheckin) {
        const date = new Date(this.checkinData.lastCheckin);
        lastCheckinEl.textContent = date.toLocaleDateString();
      } else {
        lastCheckinEl.textContent = '—';
      }
    }
  }

  /**
   * Update check-in UI
   */
  updateCheckinUI() {
    const checkinBtn = document.getElementById('checkin-btn');
    const todayStatus = document.getElementById('today-status');

    if (!this.isConnected) {
      if (checkinBtn) {
        checkinBtn.disabled = true;
        checkinBtn.style.opacity = '0.5';
        checkinBtn.style.cursor = 'not-allowed';
      }
      if (todayStatus) todayStatus.textContent = 'Connect your wallet to check in';
    } else if (this.hasCheckedInToday()) {
      if (checkinBtn) {
        checkinBtn.disabled = true;
        checkinBtn.style.opacity = '0.7';
        checkinBtn.textContent = '✅ Already Checked In Today';
        checkinBtn.style.cursor = 'not-allowed';
      }
      if (todayStatus) todayStatus.textContent = 'You have already checked in today. Come back tomorrow!';
    } else {
      if (checkinBtn) {
        checkinBtn.disabled = false;
        checkinBtn.style.opacity = '1';
        checkinBtn.textContent = '📱 Check In Today';
        checkinBtn.style.cursor = 'pointer';
      }
      if (todayStatus) todayStatus.textContent = 'You are ready to check in today!';
    }
  }

  /**
   * Show notification/toast
   */
  showNotification(message, type = 'info') {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Save user data to localStorage
   */
  saveUserData() {
    try {
      localStorage.setItem('dailycheckin_data', JSON.stringify(this.checkinData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  /**
   * Load user data from localStorage
   */
  loadUserData() {
    try {
      const saved = localStorage.getItem('dailycheckin_data');
      if (saved) {
        this.checkinData = JSON.parse(saved);
      }

      // Restore wallet connection state
      const savedWallet = localStorage.getItem('dailycheckin_wallet');
      if (savedWallet) {
        this.userAddress = savedWallet;
        this.isConnected = localStorage.getItem('dailycheckin_connected') === 'true';
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  /**
   * Handle storage changes (for multi-tab support)
   */
  handleStorageChange() {
    this.loadUserData();
    this.updateUI();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 DOM Content Loaded - Initializing Daily Checkin App');
  window.app = new DailyCheckinApp();
});
