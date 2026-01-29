/**
 * Notification Manager
 * Handles toast notifications and alerts
 */

class NotificationManager {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('notifications-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notifications-container';
      this.container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }

    this.notifications = [];
    this.maxNotifications = options.maxNotifications || 5;
    this.defaultDuration = options.defaultDuration || 5000;
  }

  /**
   * Show success notification
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  /**
   * Show error notification
   */
  error(message, options = {}) {
    return this.show(message, 'error', options);
  }

  /**
   * Show info notification
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * Show warning notification
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  /**
   * Show notification
   */
  show(message, type = 'info', options = {}) {
    // Remove old notifications if max reached
    if (this.notifications.length >= this.maxNotifications) {
      const oldest = this.notifications.shift();
      oldest.element?.remove();
    }

    const notification = {
      id: Date.now(),
      message,
      type,
      element: null,
      timeout: null,
    };

    const element = this.createNotificationElement(notification);
    notification.element = element;
    this.container.appendChild(element);

    this.notifications.push(notification);

    const duration = options.duration !== undefined ? options.duration : this.defaultDuration;

    if (duration > 0) {
      notification.timeout = setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }

    return notification.id;
  }

  /**
   * Create notification DOM element
   */
  createNotificationElement(notification) {
    const toast = document.createElement('div');
    toast.className = `toast ${notification.type}`;
    toast.style.cssText = `
      animation: slideInRight 0.3s ease-out;
      pointer-events: auto;
      cursor: pointer;
    `;
    toast.textContent = notification.message;

    toast.addEventListener('click', () => {
      this.remove(notification.id);
    });

    return toast;
  }

  /**
   * Remove notification
   */
  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return;

    const notification = this.notifications[index];
    clearTimeout(notification.timeout);

    if (notification.element) {
      notification.element.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        notification.element?.remove();
      }, 300);
    }

    this.notifications.splice(index, 1);
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.notifications.forEach(n => {
      clearTimeout(n.timeout);
      n.element?.remove();
    });
    this.notifications = [];
  }

  /**
   * Get notification count
   */
  count() {
    return this.notifications.length;
  }
}

/**
 * Modal Manager
 * Handles modal dialogs
 */

class ModalManager {
  constructor() {
    this.modals = [];
    this.container = null;
    this.init();
  }

  /**
   * Initialize modal container
   */
  init() {
    this.container = document.createElement('div');
    this.container.id = 'modals-container';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 50;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Create modal
   */
  create(options = {}) {
    const modal = {
      id: Date.now(),
      title: options.title || 'Modal',
      content: options.content || '',
      actions: options.actions || [],
      onClose: options.onClose || null,
      overlay: null,
      element: null,
      isOpen: false,
    };

    return modal;
  }

  /**
   * Open modal
   */
  open(modal) {
    if (modal.isOpen) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(5px);
      animation: fadeIn 0.3s ease-out;
    `;

    // Create modal element
    const element = document.createElement('div');
    element.className = 'modal';
    element.style.cssText = `
      animation: slideIn 0.3s ease-out;
      max-width: 600px;
      width: 90%;
    `;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close(modal));

    // Title
    const titleEl = document.createElement('h2');
    titleEl.textContent = modal.title;
    titleEl.style.marginTop = '0';

    // Content
    const contentEl = document.createElement('div');
    contentEl.innerHTML = modal.content;

    // Actions
    const actionsEl = document.createElement('div');
    actionsEl.style.cssText = `
      display: flex;
      gap: 12px;
      margin-top: 24px;
      justify-content: flex-end;
    `;

    modal.actions.forEach(action => {
      const btn = document.createElement('button');
      btn.className = action.primary ? 'btn btn-primary' : 'btn';
      btn.textContent = action.label;
      btn.addEventListener('click', () => {
        action.callback?.();
        this.close(modal);
      });
      actionsEl.appendChild(btn);
    });

    element.appendChild(closeBtn);
    element.appendChild(titleEl);
    element.appendChild(contentEl);
    if (modal.actions.length > 0) {
      element.appendChild(actionsEl);
    }

    overlay.appendChild(element);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close(modal);
    });

    this.container.appendChild(overlay);

    modal.overlay = overlay;
    modal.element = element;
    modal.isOpen = true;

    this.modals.push(modal);
  }

  /**
   * Close modal
   */
  close(modal) {
    if (!modal.isOpen) return;

    if (modal.overlay) {
      modal.overlay.style.animation = 'fadeOut 0.3s ease-in';
      setTimeout(() => {
        modal.overlay?.remove();
        modal.onClose?.();
      }, 300);
    }

    modal.isOpen = false;

    const index = this.modals.findIndex(m => m.id === modal.id);
    if (index !== -1) {
      this.modals.splice(index, 1);
    }
  }

  /**
   * Confirm dialog
   */
  async confirm(title, message) {
    return new Promise((resolve) => {
      const modal = this.create({
        title,
        content: message,
        actions: [
          {
            label: 'Cancel',
            callback: () => resolve(false),
          },
          {
            label: 'Confirm',
            primary: true,
            callback: () => resolve(true),
          },
        ],
      });

      this.open(modal);
    });
  }

  /**
   * Alert dialog
   */
  async alert(title, message) {
    return new Promise((resolve) => {
      const modal = this.create({
        title,
        content: message,
        actions: [
          {
            label: 'OK',
            primary: true,
            callback: () => resolve(true),
          },
        ],
      });

      this.open(modal);
    });
  }

  /**
   * Close all modals
   */
  closeAll() {
    [...this.modals].forEach(modal => this.close(modal));
  }

  /**
   * Get open modals count
   */
  count() {
    return this.modals.length;
  }
}

// Create global instances
const notificationManager = new NotificationManager();
const modalManager = new ModalManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NotificationManager,
    ModalManager,
    notificationManager,
    modalManager,
  };
}
