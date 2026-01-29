/**
 * Plugin System
 * Extensible plugin architecture
 */

class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  /**
   * Register plugin
   */
  registerPlugin(name, plugin) {
    if (this.plugins.has(name)) {
      console.warn(`Plugin ${name} already registered`);
      return false;
    }

    this.plugins.set(name, {
      name,
      ...plugin,
      version: plugin.version || '1.0.0',
      enabled: true,
    });

    if (plugin.install) {
      plugin.install();
    }

    console.log(`✅ Plugin registered: ${name} v${plugin.version}`);
    return true;
  }

  /**
   * Unregister plugin
   */
  unregisterPlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.uninstall) {
      plugin.uninstall();
    }
    this.plugins.delete(name);
  }

  /**
   * Get plugin
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }

  /**
   * Enable plugin
   */
  enablePlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin) plugin.enabled = true;
  }

  /**
   * Disable plugin
   */
  disablePlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin) plugin.enabled = false;
  }

  /**
   * Add hook
   */
  addHook(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push(callback);
  }

  /**
   * Execute hook
   */
  async executeHook(hookName, ...args) {
    const callbacks = this.hooks.get(hookName) || [];
    for (const callback of callbacks) {
      await callback(...args);
    }
  }

  /**
   * Get all plugins
   */
  getPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Reload all plugins
   */
  reloadAll() {
    this.plugins.forEach((plugin, name) => {
      if (plugin.reload) {
        plugin.reload();
      }
    });
  }
}

/**
 * Theme Plugin Example
 */

const themePlugin = {
  name: 'theme',
  version: '1.0.0',

  install() {
    console.log('Installing theme plugin...');
  },

  uninstall() {
    console.log('Uninstalling theme plugin...');
  },

  setTheme(themeName) {
    themeManager.setTheme(themeName);
  },

  getAvailableThemes() {
    return themeManager.getAvailableThemes();
  },
};

/**
 * Analytics Plugin Example
 */

const analyticsPlugin = {
  name: 'analytics',
  version: '1.0.0',

  install() {
    console.log('Installing analytics plugin...');
  },

  trackEvent(name, data) {
    analyticsTracker.track(name, data);
  },

  getSummary() {
    return analyticsTracker.getSummary();
  },
};

// Export plugin system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PluginSystem,
    themePlugin,
    analyticsPlugin,
  };
}
