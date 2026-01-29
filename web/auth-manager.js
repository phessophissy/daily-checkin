/**
 * Authentication Manager
 * Handle user authentication and sessions
 */

class AuthManager {
  constructor(config = {}) {
    this.config = {
      storageKey: config.storageKey || 'auth-token',
      sessionKey: config.sessionKey || 'auth-session',
      refreshKey: config.refreshKey || 'auth-refresh',
      tokenTimeout: config.tokenTimeout || 3600000, // 1 hour
      ...config
    };

    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    this.listeners = [];

    this.loadSession();
  }

  /**
   * Login
   */
  async login(credentials) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      this.setToken(data.token, data.refreshToken);
      this.user = data.user;
      this.isAuthenticated = true;

      this.notifyListeners('login', this.user);
      console.log('✅ Logged in:', this.user.email);

      return { success: true, user: this.user };
    } catch (error) {
      this.notifyListeners('login-error', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    this.clearSession();
    this.notifyListeners('logout');
    console.log('✅ Logged out');
  }

  /**
   * Register
   */
  async register(userInfo) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInfo)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      return { success: true, message: 'Registration successful. Please log in.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify token
   */
  async verifyToken() {
    if (!this.token) return false;

    try {
      const response = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
        this.isAuthenticated = true;
        return true;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }

    return false;
  }

  /**
   * Refresh token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      this.clearSession();
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.token, data.refreshToken);
        console.log('🔄 Token refreshed');
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearSession();
    return false;
  }

  /**
   * Set token
   */
  setToken(token, refreshToken = null) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem(this.config.storageKey, token);
    if (refreshToken) {
      localStorage.setItem(this.config.refreshKey, refreshToken);
    }

    // Setup token refresh
    this.setupTokenRefresh();
  }

  /**
   * Setup token refresh
   */
  setupTokenRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    this.refreshTimeout = setTimeout(() => {
      this.refreshAccessToken();
    }, this.config.tokenTimeout * 0.9); // Refresh at 90% of timeout
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    if (!this.token) return null;
    return { 'Authorization': `Bearer ${this.token}` };
  }

  /**
   * Load session
   */
  loadSession() {
    const token = localStorage.getItem(this.config.storageKey);
    const refreshToken = localStorage.getItem(this.config.refreshKey);

    if (token) {
      this.token = token;
      this.refreshToken = refreshToken;
      this.verifyToken();
    }
  }

  /**
   * Clear session
   */
  clearSession() {
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem(this.config.storageKey);
    localStorage.removeItem(this.config.refreshKey);
    clearTimeout(this.refreshTimeout);
  }

  /**
   * Change password
   */
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      if (response.ok) {
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        return { success: true, message: 'Reset link sent to email' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      if (response.ok) {
        return { success: true, message: 'Password reset successful' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: this.getAuthHeader()
      });

      if (response.ok) {
        this.user = await response.json();
        return this.user;
      }
    } catch (error) {
      console.error('Failed to get profile:', error);
    }
  }

  /**
   * Update profile
   */
  async updateProfile(updates) {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        this.user = await response.json();
        this.notifyListeners('profile-updated', this.user);
        return { success: true, user: this.user };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add listener
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback({ event, data });
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Check if authenticated
   */
  isLoggedIn() {
    return this.isAuthenticated && !!this.token;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
