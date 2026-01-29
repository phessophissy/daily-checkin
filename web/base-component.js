/**
 * Component Base Classes
 * Reusable component patterns
 */

class BaseComponent {
  constructor(config = {}) {
    this.config = config;
    this.element = null;
    this.listeners = [];
  }

  /**
   * Create element
   */
  createElement(tag = 'div', classes = []) {
    this.element = document.createElement(tag);
    if (classes.length > 0) {
      this.element.classList.add(...classes);
    }
    return this.element;
  }

  /**
   * Set HTML
   */
  setHTML(html) {
    if (this.element) {
      this.element.innerHTML = html;
    }
  }

  /**
   * Set text
   */
  setText(text) {
    if (this.element) {
      this.element.textContent = text;
    }
  }

  /**
   * Add child
   */
  addChild(child) {
    if (this.element) {
      if (child instanceof BaseComponent) {
        this.element.appendChild(child.element);
      } else {
        this.element.appendChild(child);
      }
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (this.element) {
      this.element.addEventListener(event, callback);
      this.listeners.push({ event, callback });
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.element) {
      this.element.removeEventListener(event, callback);
      this.listeners = this.listeners.filter(l => !(l.event === event && l.callback === callback));
    }
  }

  /**
   * Set attributes
   */
  setAttributes(attrs) {
    if (this.element) {
      Object.entries(attrs).forEach(([key, value]) => {
        this.element.setAttribute(key, value);
      });
    }
  }

  /**
   * Set styles
   */
  setStyles(styles) {
    if (this.element) {
      Object.entries(styles).forEach(([key, value]) => {
        this.element.style[key] = value;
      });
    }
  }

  /**
   * Add class
   */
  addClass(...classes) {
    if (this.element) {
      this.element.classList.add(...classes);
    }
  }

  /**
   * Remove class
   */
  removeClass(...classes) {
    if (this.element) {
      this.element.classList.remove(...classes);
    }
  }

  /**
   * Toggle class
   */
  toggleClass(className, force) {
    if (this.element) {
      this.element.classList.toggle(className, force);
    }
  }

  /**
   * Show element
   */
  show() {
    if (this.element) {
      this.element.style.display = '';
    }
  }

  /**
   * Hide element
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Render
   */
  render(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container && this.element) {
      container.appendChild(this.element);
    }
    return this.element;
  }

  /**
   * Destroy
   */
  destroy() {
    this.listeners.forEach(({ event, callback }) => {
      if (this.element) {
        this.element.removeEventListener(event, callback);
      }
    });
    this.listeners = [];
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * Observable Component
 */
class ObservableComponent extends BaseComponent {
  constructor(config = {}) {
    super(config);
    this.state = config.initialState || {};
    this.observers = [];
  }

  /**
   * Set state
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifyObservers();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this.observers.push(callback);
  }

  /**
   * Notify observers
   */
  notifyObservers() {
    this.observers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  /**
   * Get state
   */
  getState() {
    return this.state;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BaseComponent,
    ObservableComponent
  };
}
