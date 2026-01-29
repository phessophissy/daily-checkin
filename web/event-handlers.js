/**
 * Event Handlers
 * Centralized event handling for the app
 */

class EventHandlers {
  constructor() {
    this.handlers = new Map();
    this.delegatedHandlers = new Map();
  }

  /**
   * Register handler
   */
  on(element, eventType, selector, callback) {
    if (typeof selector === 'function') {
      callback = selector;
      selector = null;
    }

    const key = `${eventType}:${selector || 'direct'}`;
    if (!this.handlers.has(element)) {
      this.handlers.set(element, new Map());
    }

    if (selector) {
      element.addEventListener(eventType, (e) => {
        if (e.target.matches(selector)) {
          callback.call(e.target, e);
        }
      });
    } else {
      element.addEventListener(eventType, callback);
    }

    this.handlers.get(element).set(key, callback);
  }

  /**
   * Remove handler
   */
  off(element, eventType, callback) {
    element.removeEventListener(eventType, callback);
  }

  /**
   * One-time handler
   */
  once(element, eventType, callback) {
    const wrappedCallback = (e) => {
      callback(e);
      this.off(element, eventType, wrappedCallback);
    };
    this.on(element, eventType, wrappedCallback);
  }

  /**
   * Debounce handler
   */
  onDebounce(element, eventType, callback, delay = 300) {
    let timeoutId;
    const debouncedCallback = (e) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(e), delay);
    };
    this.on(element, eventType, debouncedCallback);
    return () => clearTimeout(timeoutId);
  }

  /**
   * Throttle handler
   */
  onThrottle(element, eventType, callback, limit = 300) {
    let inThrottle;
    const throttledCallback = (e) => {
      if (!inThrottle) {
        callback(e);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
    this.on(element, eventType, throttledCallback);
  }
}

/**
 * Form Event Handlers
 */
class FormEventHandlers {
  /**
   * Handle form submission
   */
  static onSubmit(form, callback) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      callback(data);
    });
  }

  /**
   * Handle input change
   */
  static onChange(input, callback) {
    input.addEventListener('change', (e) => {
      callback(e.target.value);
    });
  }

  /**
   * Handle input with debounce
   */
  static onInputDebounce(input, callback, delay = 300) {
    let timeoutId;
    input.addEventListener('input', (e) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(e.target.value);
      }, delay);
    });
  }

  /**
   * Handle checkbox change
   */
  static onCheckboxChange(checkbox, callback) {
    checkbox.addEventListener('change', (e) => {
      callback(e.target.checked);
    });
  }

  /**
   * Handle radio change
   */
  static onRadioChange(radioName, callback) {
    const radios = document.querySelectorAll(`input[name="${radioName}"]`);
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          callback(e.target.value);
        }
      });
    });
  }

  /**
   * Handle select change
   */
  static onSelectChange(select, callback) {
    select.addEventListener('change', (e) => {
      callback(e.target.value);
    });
  }

  /**
   * Validate on input
   */
  static onValidate(input, validator, callback) {
    input.addEventListener('input', (e) => {
      const isValid = validator(e.target.value);
      callback(isValid, e.target.value);
    });
  }
}

/**
 * Click Event Handlers
 */
class ClickEventHandlers {
  /**
   * Handle button click
   */
  static onClick(button, callback) {
    button.addEventListener('click', callback);
  }

  /**
   * Handle double click
   */
  static onDoubleClick(element, callback) {
    element.addEventListener('dblclick', callback);
  }

  /**
   * Handle click outside
   */
  static onClickOutside(element, callback) {
    document.addEventListener('click', (e) => {
      if (!element.contains(e.target)) {
        callback(e);
      }
    });
  }

  /**
   * Handle right click
   */
  static onContextMenu(element, callback) {
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      callback(e);
    });
  }

  /**
   * Handle long press
   */
  static onLongPress(element, callback, duration = 500) {
    let timeoutId;
    element.addEventListener('mousedown', () => {
      timeoutId = setTimeout(callback, duration);
    });
    element.addEventListener('mouseup', () => {
      clearTimeout(timeoutId);
    });
    element.addEventListener('mouseleave', () => {
      clearTimeout(timeoutId);
    });
  }
}

/**
 * DOM Event Handlers
 */
class DOMEventHandlers {
  /**
   * Handle scroll
   */
  static onScroll(element, callback) {
    element.addEventListener('scroll', callback);
  }

  /**
   * Handle resize
   */
  static onResize(callback) {
    window.addEventListener('resize', callback);
  }

  /**
   * Handle visibility change
   */
  static onVisibilityChange(callback) {
    document.addEventListener('visibilitychange', () => {
      callback(document.hidden);
    });
  }

  /**
   * Handle page show
   */
  static onPageShow(callback) {
    window.addEventListener('pageshow', callback);
  }

  /**
   * Handle page hide
   */
  static onPageHide(callback) {
    window.addEventListener('pagehide', callback);
  }

  /**
   * Observe element intersection
   */
  static observeIntersection(elements, callback, options = {}) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        callback(entry);
      });
    }, options);

    if (Array.isArray(elements)) {
      elements.forEach(el => observer.observe(el));
    } else {
      observer.observe(elements);
    }

    return observer;
  }

  /**
   * Observe element mutations
   */
  static observeMutations(element, callback, options = {}) {
    const observer = new MutationObserver((mutations) => {
      callback(mutations);
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      ...options
    });

    return observer;
  }
}

/**
 * Keyboard Event Handlers
 */
class KeyboardEventHandlers {
  /**
   * Handle key down
   */
  static onKeyDown(element, callback) {
    element.addEventListener('keydown', callback);
  }

  /**
   * Handle key press
   */
  static onKeyPress(element, callback) {
    element.addEventListener('keypress', callback);
  }

  /**
   * Handle specific key
   */
  static onKey(element, key, callback) {
    element.addEventListener('keydown', (e) => {
      if (e.key === key || e.code === key) {
        callback(e);
      }
    });
  }

  /**
   * Handle key combination
   */
  static onKeyCombo(element, combo, callback) {
    const { ctrl = false, alt = false, shift = false, key } = combo;
    element.addEventListener('keydown', (e) => {
      if (e.ctrlKey === ctrl && e.altKey === alt && e.shiftKey === shift && e.key === key) {
        callback(e);
      }
    });
  }

  /**
   * Handle Enter key
   */
  static onEnter(element, callback) {
    element.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        callback(e);
      }
    });
  }

  /**
   * Handle Escape key
   */
  static onEscape(element, callback) {
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        callback(e);
      }
    });
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EventHandlers,
    FormEventHandlers,
    ClickEventHandlers,
    DOMEventHandlers,
    KeyboardEventHandlers
  };
}
