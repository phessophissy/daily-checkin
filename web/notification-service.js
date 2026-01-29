/**
 * Notification Service
 * Push notifications and system notifications
 */

class NotificationService {
  constructor(config = {}) {
    this.config = {
      enablePush: config.enablePush !== false,
      enableNotifications: config.enableNotifications !== false,
      requestPermission: config.requestPermission !== false,
      ...config
    };

    this.serviceWorkerRegistration = null;
    this.notificationCallbacks = new Map();
    this.init();
  }

  /**
   * Initialize notification service
   */
  async init() {
    if (!this.config.enableNotifications) return;

    try {
      if ('serviceWorker' in navigator) {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('✅ Service worker registered');
      }

      if (this.config.requestPermission && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log(`🔔 Notification permission: ${permission}`);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Send notification
   */
  async sendNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/icon.png',
      badge: '/badge.png',
      ...options
    });

    notification.addEventListener('click', () => {
      this.handleNotificationClick(options.tag);
    });

    return notification;
  }

  /**
   * Handle notification click
   */
  handleNotificationClick(tag) {
    if (this.notificationCallbacks.has(tag)) {
      this.notificationCallbacks.get(tag)();
    }
  }

  /**
   * Register notification callback
   */
  onNotificationClick(tag, callback) {
    this.notificationCallbacks.set(tag, callback);
  }

  /**
   * Send checkin reminder
   */
  async sendCheckinReminder() {
    await this.sendNotification('Daily Check-in Reminder', {
      tag: 'checkin-reminder',
      body: 'Time to check in and maintain your streak!',
      data: { type: 'checkin-reminder' }
    });
  }

  /**
   * Send reward notification
   */
  async sendRewardNotification(amount, message) {
    await this.sendNotification('🎉 Reward Earned!', {
      tag: 'reward',
      body: `${message} (+${amount} STX)`,
      data: { type: 'reward', amount }
    });
  }

  /**
   * Send transaction notification
   */
  async sendTransactionNotification(hash, status) {
    const messages = {
      pending: 'Transaction submitted. Waiting for confirmation...',
      confirmed: 'Transaction confirmed!',
      failed: 'Transaction failed. Please try again.'
    };

    await this.sendNotification('Transaction Update', {
      tag: 'transaction',
      body: messages[status] || 'Transaction status updated',
      data: { type: 'transaction', hash, status }
    });
  }

  /**
   * Send error notification
   */
  async sendErrorNotification(message) {
    await this.sendNotification('Error', {
      tag: 'error',
      body: message,
      data: { type: 'error' }
    });
  }

  /**
   * Send success notification
   */
  async sendSuccessNotification(message) {
    await this.sendNotification('Success', {
      tag: 'success',
      body: message,
      data: { type: 'success' }
    });
  }

  /**
   * Schedule notification
   */
  scheduleNotification(delay, title, options) {
    setTimeout(() => {
      this.sendNotification(title, options);
    }, delay);
  }

  /**
   * Schedule daily checkin reminder
   */
  scheduleDailyReminder(hour = 9, minute = 0) {
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target - now;
    console.log(`⏰ Daily reminder scheduled for ${target.toLocaleTimeString()}`);

    setInterval(() => {
      this.sendCheckinReminder();
    }, 24 * 60 * 60 * 1000);

    setTimeout(() => {
      this.sendCheckinReminder();
      setInterval(() => {
        this.sendCheckinReminder();
      }, 24 * 60 * 60 * 1000);
    }, delay);
  }

  /**
   * Send batch notifications
   */
  async sendBatchNotifications(notifications) {
    for (const notif of notifications) {
      await this.sendNotification(notif.title, notif.options);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus() {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
  }

  /**
   * Close notification by tag
   */
  closeNotification(tag) {
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.getNotifications({ tag }).then(notifications => {
        notifications.forEach(n => n.close());
      });
    }
  }

  /**
   * Close all notifications
   */
  closeAllNotifications() {
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.getNotifications().then(notifications => {
        notifications.forEach(n => n.close());
      });
    }
  }

  /**
   * Enable/disable notifications
   */
  setEnabled(enabled) {
    this.config.enableNotifications = enabled;
  }

  /**
   * Destroy service
   */
  async destroy() {
    if (this.serviceWorkerRegistration) {
      await this.serviceWorkerRegistration.unregister();
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationService;
}
