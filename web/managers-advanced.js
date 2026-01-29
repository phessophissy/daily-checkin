/**
 * Wallet Manager
 * Enhanced wallet management with features
 */

class WalletManager {
  constructor(walletIntegration) {
    this.wallet = walletIntegration;
    this.wallets = [];
    this.currentWallet = null;
    this.history = [];
  }

  /**
   * Add wallet
   */
  addWallet(wallet) {
    if (!this.wallets.find(w => w.address === wallet.address)) {
      this.wallets.push(wallet);
    }
  }

  /**
   * Remove wallet
   */
  removeWallet(address) {
    this.wallets = this.wallets.filter(w => w.address !== address);
  }

  /**
   * Get all wallets
   */
  getWallets() {
    return this.wallets;
  }

  /**
   * Connect wallet
   */
  async connectWallet(wallet = null) {
    try {
      if (wallet) {
        this.currentWallet = wallet;
      } else {
        const result = await this.wallet.connectWallet();
        this.currentWallet = {
          address: result.userAddress,
          connected: true,
        };
        this.addWallet(this.currentWallet);
      }

      this.recordHistory('connect', this.currentWallet.address);
      return this.currentWallet;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet() {
    try {
      await this.wallet.disconnectWallet();
      this.recordHistory('disconnect', this.currentWallet?.address);
      this.currentWallet = null;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  /**
   * Get current wallet
   */
  getCurrentWallet() {
    return this.currentWallet;
  }

  /**
   * Is connected
   */
  isConnected() {
    return this.currentWallet !== null;
  }

  /**
   * Record history
   */
  recordHistory(action, address) {
    this.history.push({
      action,
      address,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get history
   */
  getHistory() {
    return this.history;
  }
}

/**
 * Checkin Manager
 * Enhanced checkin management
 */

class CheckinManager {
  constructor() {
    this.checkins = [];
    this.streaks = new Map();
  }

  /**
   * Record checkin
   */
  recordCheckin(address, checkin) {
    this.checkins.push({
      address,
      ...checkin,
      timestamp: new Date().toISOString(),
    });

    this.updateStreak(address);
  }

  /**
   * Update streak
   */
  updateStreak(address) {
    const userCheckins = this.checkins.filter(c => c.address === address);
    if (userCheckins.length === 0) {
      this.streaks.set(address, 0);
      return;
    }

    const sorted = userCheckins
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].timestamp);
      const curr = new Date(sorted[i].timestamp);
      const dayDiff = (prev - curr) / (1000 * 60 * 60 * 24);

      if (dayDiff >= 1 && dayDiff <= 2) {
        streak++;
      } else {
        break;
      }
    }

    this.streaks.set(address, streak);
  }

  /**
   * Get streak
   */
  getStreak(address) {
    return this.streaks.get(address) || 0;
  }

  /**
   * Get checkins by address
   */
  getCheckinsByAddress(address) {
    return this.checkins.filter(c => c.address === address);
  }

  /**
   * Get today's checkin
   */
  getTodayCheckin(address) {
    const today = new Date().toDateString();
    return this.checkins.find(c => 
      c.address === address && 
      new Date(c.timestamp).toDateString() === today
    );
  }

  /**
   * Has checked in today
   */
  hasCheckedInToday(address) {
    return this.getTodayCheckin(address) !== undefined;
  }

  /**
   * Get statistics
   */
  getStatistics(address) {
    const userCheckins = this.getCheckinsByAddress(address);
    return {
      totalCheckins: userCheckins.length,
      currentStreak: this.getStreak(address),
      lastCheckin: userCheckins[userCheckins.length - 1]?.timestamp || null,
      hasCheckedInToday: this.hasCheckedInToday(address),
    };
  }
}

/**
 * Reward Manager
 * Manage rewards and points
 */

class RewardManager {
  constructor() {
    this.rewards = new Map();
    this.totalDistributed = 0;
  }

  /**
   * Calculate reward
   */
  calculateReward(streakDays, baseReward = 0.001) {
    const multiplier = 1 + (streakDays * 0.01);
    return baseReward * multiplier;
  }

  /**
   * Award reward
   */
  awardReward(address, amount) {
    const current = this.rewards.get(address) || 0;
    this.rewards.set(address, current + amount);
    this.totalDistributed += amount;
  }

  /**
   * Get reward
   */
  getReward(address) {
    return this.rewards.get(address) || 0;
  }

  /**
   * Get all rewards
   */
  getAllRewards() {
    const result = {};
    this.rewards.forEach((reward, address) => {
      result[address] = reward;
    });
    return result;
  }

  /**
   * Get total distributed
   */
  getTotalDistributed() {
    return this.totalDistributed;
  }

  /**
   * Get top earners
   */
  getTopEarners(limit = 10) {
    return Array.from(this.rewards.entries())
      .map(([address, reward]) => ({ address, reward }))
      .sort((a, b) => b.reward - a.reward)
      .slice(0, limit);
  }

  /**
   * Reset rewards
   */
  resetRewards() {
    this.rewards.clear();
    this.totalDistributed = 0;
  }
}

// Export managers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WalletManager,
    CheckinManager,
    RewardManager,
  };
}
