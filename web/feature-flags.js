/**
 * Feature Flags System
 * Dynamic feature toggling and A/B testing
 */

class FeatureFlags {
  constructor(config = {}) {
    this.flags = new Map();
    this.config = {
      storageKey: config.storageKey || 'feature-flags',
      persistFlags: config.persistFlags !== false,
      ...config
    };

    this.loadFlags();
  }

  /**
   * Set flag
   */
  setFlag(name, enabled, metadata = {}) {
    this.flags.set(name, {
      enabled,
      metadata,
      createdAt: new Date().toISOString()
    });

    this.persistFlags();
  }

  /**
   * Get flag
   */
  getFlag(name) {
    const flag = this.flags.get(name);
    return flag?.enabled || false;
  }

  /**
   * Check feature
   */
  isFeatureEnabled(name) {
    return this.getFlag(name);
  }

  /**
   * Get all flags
   */
  getAllFlags() {
    const flags = {};
    this.flags.forEach((value, key) => {
      flags[key] = value.enabled;
    });
    return flags;
  }

  /**
   * Toggle flag
   */
  toggleFlag(name) {
    const flag = this.flags.get(name);
    if (flag) {
      flag.enabled = !flag.enabled;
      this.persistFlags();
    }
  }

  /**
   * Delete flag
   */
  deleteFlag(name) {
    this.flags.delete(name);
    this.persistFlags();
  }

  /**
   * Persist flags
   */
  persistFlags() {
    if (this.config.persistFlags) {
      const data = {};
      this.flags.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    }
  }

  /**
   * Load flags
   */
  loadFlags() {
    if (!this.config.persistFlags) return;

    try {
      const data = localStorage.getItem(this.config.storageKey);
      if (data) {
        const flags = JSON.parse(data);
        Object.entries(flags).forEach(([name, value]) => {
          this.flags.set(name, value);
        });
      }
    } catch (error) {
      console.error('Failed to load flags:', error);
    }
  }

  /**
   * Clear all flags
   */
  clearFlags() {
    this.flags.clear();
    localStorage.removeItem(this.config.storageKey);
  }
}

/**
 * A/B Testing Manager
 */
class ABTesting {
  constructor() {
    this.experiments = new Map();
    this.variants = new Map();
  }

  /**
   * Create experiment
   */
  createExperiment(name, variants, config = {}) {
    const experiment = {
      name,
      variants,
      startDate: new Date(),
      enabled: config.enabled !== false,
      weights: config.weights || this.equalWeights(variants),
      userId: this.getUserId()
    };

    this.experiments.set(name, experiment);
    return experiment;
  }

  /**
   * Get variant
   */
  getVariant(experimentName) {
    const experiment = this.experiments.get(experimentName);
    if (!experiment || !experiment.enabled) {
      return null;
    }

    const stored = sessionStorage.getItem(`ab-variant-${experimentName}`);
    if (stored) {
      return stored;
    }

    const variant = this.selectVariant(experiment);
    sessionStorage.setItem(`ab-variant-${experimentName}`, variant);
    return variant;
  }

  /**
   * Select variant
   */
  selectVariant(experiment) {
    const rand = Math.random();
    let cumulative = 0;

    for (const variant of experiment.variants) {
      const weight = experiment.weights[variant] || 1 / experiment.variants.length;
      cumulative += weight;
      if (rand < cumulative) {
        return variant;
      }
    }

    return experiment.variants[0];
  }

  /**
   * Track conversion
   */
  trackConversion(experimentName, conversionValue = 1) {
    const key = `ab-conversion-${experimentName}`;
    const current = parseInt(sessionStorage.getItem(key) || '0');
    sessionStorage.setItem(key, (current + conversionValue).toString());
  }

  /**
   * Get results
   */
  getResults(experimentName) {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) return null;

    const conversions = {};
    experiment.variants.forEach(variant => {
      conversions[variant] = parseInt(sessionStorage.getItem(`ab-conversion-${experimentName}-${variant}`) || '0');
    });

    return {
      experiment: experimentName,
      variants: experiment.variants,
      conversions,
      duration: new Date() - experiment.startDate
    };
  }

  /**
   * Equal weights
   */
  equalWeights(variants) {
    const weight = 1 / variants.length;
    const weights = {};
    variants.forEach(variant => {
      weights[variant] = weight;
    });
    return weights;
  }

  /**
   * Get user ID
   */
  getUserId() {
    let userId = localStorage.getItem('ab-user-id');
    if (!userId) {
      userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ab-user-id', userId);
    }
    return userId;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FeatureFlags,
    ABTesting
  };
}
