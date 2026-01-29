/**
 * Form Manager
 * Handles form validation and submission
 */

class FormManager {
  constructor(options = {}) {
    this.forms = new Map();
    this.validationRules = options.validationRules || {};
  }

  /**
   * Register form
   */
  register(formId, config = {}) {
    const form = {
      id: formId,
      element: document.getElementById(formId),
      fields: config.fields || {},
      validators: config.validators || {},
      onSubmit: config.onSubmit || null,
      errors: {},
    };

    if (form.element) {
      form.element.addEventListener('submit', (e) => this.handleSubmit(e, form));
    }

    this.forms.set(formId, form);
    return form;
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e, form) {
    e.preventDefault();

    // Validate form
    if (!this.validate(form)) {
      return;
    }

    // Get form data
    const data = this.getFormData(form);

    // Call submit handler
    if (form.onSubmit) {
      try {
        await form.onSubmit(data);
      } catch (error) {
        console.error('Form submission error:', error);
        form.errors.submit = error.message;
        this.displayErrors(form);
      }
    }
  }

  /**
   * Validate form
   */
  validate(form) {
    form.errors = {};

    for (const [fieldName, fieldConfig] of Object.entries(form.fields)) {
      const input = form.element?.querySelector(`[name="${fieldName}"]`);
      if (!input) continue;

      const value = input.value;
      const rules = fieldConfig.rules || [];

      for (const rule of rules) {
        const error = this.validateField(value, rule);
        if (error) {
          form.errors[fieldName] = error;
          break;
        }
      }
    }

    this.displayErrors(form);
    return Object.keys(form.errors).length === 0;
  }

  /**
   * Validate single field
   */
  validateField(value, rule) {
    if (rule.required && !value.trim()) {
      return rule.message || 'This field is required';
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `Minimum ${rule.minLength} characters required`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `Maximum ${rule.maxLength} characters allowed`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || 'Invalid format';
    }

    if (rule.custom && !rule.custom(value)) {
      return rule.message || 'Validation failed';
    }

    return null;
  }

  /**
   * Display form errors
   */
  displayErrors(form) {
    // Clear previous errors
    form.element?.querySelectorAll('.error-message').forEach(el => el.remove());
    form.element?.querySelectorAll('.input-field.error').forEach(el => {
      el.classList.remove('error');
    });

    // Display new errors
    for (const [fieldName, error] of Object.entries(form.errors)) {
      const input = form.element?.querySelector(`[name="${fieldName}"]`);
      if (input) {
        input.classList.add('error');

        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = error;
        errorEl.style.cssText = `
          color: #b87333;
          font-size: 0.85rem;
          margin-top: 4px;
          display: block;
        `;

        input.parentNode?.appendChild(errorEl);
      }
    }
  }

  /**
   * Get form data
   */
  getFormData(form) {
    const data = {};

    if (!form.element) return data;

    const inputs = form.element.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input.name) {
        if (input.type === 'checkbox') {
          data[input.name] = input.checked;
        } else if (input.type === 'radio') {
          if (input.checked) data[input.name] = input.value;
        } else {
          data[input.name] = input.value;
        }
      }
    });

    return data;
  }

  /**
   * Set form data
   */
  setFormData(formId, data) {
    const form = this.forms.get(formId);
    if (!form?.element) return;

    for (const [name, value] of Object.entries(data)) {
      const input = form.element.querySelector(`[name="${name}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = value;
        } else {
          input.value = value;
        }
      }
    }
  }

  /**
   * Reset form
   */
  reset(formId) {
    const form = this.forms.get(formId);
    if (form?.element) {
      form.element.reset();
      form.errors = {};
      this.displayErrors(form);
    }
  }

  /**
   * Get form errors
   */
  getErrors(formId) {
    const form = this.forms.get(formId);
    return form?.errors || {};
  }
}

/**
 * Analytics Tracker
 * Tracks user events and interactions
 */

class AnalyticsTracker {
  constructor(options = {}) {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.userId = options.userId || null;
    this.enabledEvents = options.enabledEvents || {};
    this.maxEvents = options.maxEvents || 1000;
  }

  /**
   * Track event
   */
  track(eventName, eventData = {}) {
    const event = {
      id: this.generateEventId(),
      name: eventName,
      data: eventData,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    console.log(`📊 Event tracked: ${eventName}`, eventData);

    // Send to backend if needed
    this.sendToBackend(event);
  }

  /**
   * Track page view
   */
  trackPageView(pageName) {
    this.track('page_view', {
      page: pageName,
      url: window.location.href,
      referrer: document.referrer,
    });
  }

  /**
   * Track user action
   */
  trackAction(action, target, data = {}) {
    this.track('user_action', {
      action,
      target,
      ...data,
    });
  }

  /**
   * Track checkin
   */
  trackCheckin(checkinData) {
    this.track('checkin', {
      ...checkinData,
      checkoutTime: new Date().toISOString(),
    });
  }

  /**
   * Track wallet connection
   */
  trackWalletConnection(address) {
    this.track('wallet_connected', {
      address,
      truncated: address.substring(0, 8) + '...',
    });
  }

  /**
   * Track transaction
   */
  trackTransaction(txData) {
    this.track('transaction', {
      txid: txData.txid,
      type: txData.type,
      amount: txData.amount,
      fee: txData.fee,
    });
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      context,
    });
  }

  /**
   * Send event to backend
   */
  async sendToBackend(event) {
    // This would send to analytics backend
    // Implement according to your backend API
  }

  /**
   * Get session events
   */
  getSessionEvents() {
    return this.events.filter(e => e.sessionId === this.sessionId);
  }

  /**
   * Get events by name
   */
  getEventsByName(name) {
    return this.events.filter(e => e.name === name);
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate event ID
   */
  generateEventId() {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get analytics summary
   */
  getSummary() {
    const sessionEvents = this.getSessionEvents();
    const eventCounts = {};

    sessionEvents.forEach(e => {
      eventCounts[e.name] = (eventCounts[e.name] || 0) + 1;
    });

    return {
      sessionId: this.sessionId,
      userId: this.userId,
      totalEvents: sessionEvents.length,
      eventCounts,
      startTime: sessionEvents[0]?.timestamp,
      endTime: sessionEvents[sessionEvents.length - 1]?.timestamp,
    };
  }

  /**
   * Export events
   */
  export() {
    return JSON.stringify(this.events, null, 2);
  }
}

// Create global instances
const formManager = new FormManager();
const analyticsTracker = new AnalyticsTracker({
  maxEvents: 500,
});

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FormManager,
    AnalyticsTracker,
    formManager,
    analyticsTracker,
  };
}
