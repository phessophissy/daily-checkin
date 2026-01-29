/**
 * Theme Switcher
 * Dynamic theme switching with persistence
 */

class ThemeSwitcher {
  constructor(config = {}) {
    this.config = {
      defaultTheme: config.defaultTheme || 'metallic',
      storageKey: config.storageKey || 'theme-preference',
      themes: config.themes || ['metallic', 'dark', 'light'],
      autoDetect: config.autoDetect !== false,
      ...config
    };

    this.currentTheme = this.loadTheme();
    this.listeners = [];
    this.setupMediaQuery();
  }

  /**
   * Load theme from storage
   */
  loadTheme() {
    const stored = localStorage.getItem(this.config.storageKey);
    if (stored && this.config.themes.includes(stored)) {
      return stored;
    }

    if (this.config.autoDetect) {
      return this.getPreferredTheme();
    }

    return this.config.defaultTheme;
  }

  /**
   * Get preferred theme from system
   */
  getPreferredTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'metallic';
  }

  /**
   * Setup media query listener
   */
  setupMediaQuery() {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.config.autoDetect) {
          const newTheme = e.matches ? 'dark' : 'metallic';
          if (newTheme !== this.currentTheme) {
            this.setTheme(newTheme);
          }
        }
      });
    }
  }

  /**
   * Set theme
   */
  setTheme(themeName) {
    if (!this.config.themes.includes(themeName)) {
      console.warn(`Unknown theme: ${themeName}`);
      return false;
    }

    // Remove all theme classes
    this.config.themes.forEach(theme => {
      document.documentElement.classList.remove(`${theme}-theme`);
    });

    // Add new theme class
    document.documentElement.classList.add(`${themeName}-theme`);
    this.currentTheme = themeName;

    // Save preference
    localStorage.setItem(this.config.storageKey, themeName);

    // Notify listeners
    this.notifyListeners(themeName);

    console.log(`🎨 Theme switched to: ${themeName}`);
    return true;
  }

  /**
   * Toggle between two themes
   */
  toggleTheme(theme1 = 'metallic', theme2 = 'dark') {
    const nextTheme = this.currentTheme === theme1 ? theme2 : theme1;
    this.setTheme(nextTheme);
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get available themes
   */
  getAvailableThemes() {
    return [...this.config.themes];
  }

  /**
   * Add change listener
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify listeners
   */
  notifyListeners(themeName) {
    this.listeners.forEach(callback => {
      try {
        callback(themeName);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }

  /**
   * Apply theme on load
   */
  applyTheme() {
    this.setTheme(this.currentTheme);
  }

  /**
   * Reset to default
   */
  resetToDefault() {
    localStorage.removeItem(this.config.storageKey);
    this.currentTheme = this.config.defaultTheme;
    this.applyTheme();
  }
}

/**
 * Create theme switcher component
 */
function createThemeSwitcherUI(themeNames = ['metallic', 'dark', 'light']) {
  const container = document.createElement('div');
  container.className = 'theme-switcher-container';
  container.innerHTML = `
    <div class="theme-switcher">
      ${themeNames.map(theme => `
        <button class="theme-btn" data-theme="${theme}">
          ${theme.charAt(0).toUpperCase() + theme.slice(1)}
        </button>
      `).join('')}
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .theme-switcher-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .theme-switcher {
      display: flex;
      gap: 8px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 20px;
    }

    .theme-btn {
      padding: 8px 16px;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      border-radius: 16px;
      transition: all 0.3s ease;
      font-size: 14px;
      font-weight: 600;
    }

    .theme-btn:hover {
      background: rgba(212, 165, 116, 0.2);
    }

    .theme-btn.active {
      background: rgba(212, 165, 116, 0.5);
      color: #fff;
    }

    .dark-theme .theme-switcher {
      background: rgba(212, 165, 116, 0.1);
    }

    .dark-theme .theme-btn:hover {
      background: rgba(212, 165, 116, 0.3);
    }

    .dark-theme .theme-btn.active {
      background: rgba(212, 165, 116, 0.6);
    }
  `;
  document.head.appendChild(style);

  return container;
}

/**
 * Initialize theme switcher with UI
 */
function initThemeSwitcher(config = {}) {
  const switcher = new ThemeSwitcher(config);
  switcher.applyTheme();

  const ui = createThemeSwitcherUI(config.themes || ['metallic', 'dark', 'light']);
  
  // Setup button handlers
  ui.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      switcher.setTheme(theme);
      updateActiveButton(ui, theme);
    });

    if (btn.dataset.theme === switcher.getCurrentTheme()) {
      btn.classList.add('active');
    }
  });

  switcher.onChange((theme) => {
    updateActiveButton(ui, theme);
  });

  return { switcher, ui };
}

/**
 * Update active button
 */
function updateActiveButton(ui, theme) {
  ui.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThemeSwitcher,
    createThemeSwitcherUI,
    initThemeSwitcher
  };
}
