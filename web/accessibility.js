/**
 * Accessibility Utilities
 * WCAG compliance and a11y features
 */

class AccessibilityManager {
  constructor() {
    this.highContrast = false;
    this.reduceMotion = false;
    this.fontSize = 'normal';
    this.init();
  }

  /**
   * Initialize accessibility settings
   */
  init() {
    this.detectMotionPreference();
    this.detectContrastPreference();
    this.setupAriaLive();
  }

  /**
   * Detect reduce motion preference
   */
  detectMotionPreference() {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduceMotion = motionQuery.matches;

    motionQuery.addEventListener('change', (e) => {
      this.reduceMotion = e.matches;
      this.applyMotionPreference();
    });

    this.applyMotionPreference();
  }

  /**
   * Detect contrast preference
   */
  detectContrastPreference() {
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    this.highContrast = contrastQuery.matches;

    contrastQuery.addEventListener('change', (e) => {
      this.highContrast = e.matches;
      this.applyContrastPreference();
    });

    this.applyContrastPreference();
  }

  /**
   * Apply motion preference
   */
  applyMotionPreference() {
    if (this.reduceMotion) {
      document.documentElement.style.setProperty('--transition-duration', '0s');
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.style.setProperty('--transition-duration', '0.3s');
      document.documentElement.classList.remove('reduce-motion');
    }
  }

  /**
   * Apply contrast preference
   */
  applyContrastPreference() {
    if (this.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }

  /**
   * Set font size
   */
  setFontSize(size) {
    const sizes = { small: '14px', normal: '16px', large: '18px', xlarge: '20px' };
    document.documentElement.style.fontSize = sizes[size] || sizes.normal;
    this.fontSize = size;
    localStorage.setItem('a11y-font-size', size);
  }

  /**
   * Get font size
   */
  getFontSize() {
    return this.fontSize;
  }

  /**
   * Setup aria-live region
   */
  setupAriaLive() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    document.body.appendChild(liveRegion);
  }

  /**
   * Announce message
   */
  announce(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }

  /**
   * Focus management
   */
  focusElement(element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Set focus trap
   */
  setFocusTrap(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  /**
   * Make skip link
   */
  createSkipLink(targetSelector) {
    const skipLink = document.createElement('a');
    skipLink.href = targetSelector;
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === '.') {
        const target = document.querySelector(targetSelector);
        if (target) {
          target.focus();
          target.scrollIntoView();
        }
      }
    });
  }
}

/**
 * Accessibility Checker
 */
class AccessibilityChecker {
  /**
   * Check image alt text
   */
  static checkImages() {
    const images = document.querySelectorAll('img');
    const issues = [];

    images.forEach((img, i) => {
      if (!img.alt || img.alt.trim() === '') {
        issues.push({
          type: 'missing-alt-text',
          element: img,
          message: `Image ${i} is missing alt text`
        });
      }
    });

    return issues;
  }

  /**
   * Check heading hierarchy
   */
  static checkHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues = [];
    let lastLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);

      if (level > lastLevel + 1) {
        issues.push({
          type: 'heading-hierarchy',
          element: heading,
          message: `Heading skips levels from ${lastLevel} to ${level}`
        });
      }

      lastLevel = level;
    });

    return issues;
  }

  /**
   * Check form labels
   */
  static checkFormLabels() {
    const inputs = document.querySelectorAll('input, textarea, select');
    const issues = [];

    inputs.forEach((input) => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');

      if (!hasLabel && !hasAriaLabel && !input.type === 'hidden') {
        issues.push({
          type: 'missing-label',
          element: input,
          message: 'Form input is missing a label'
        });
      }
    });

    return issues;
  }

  /**
   * Check color contrast
   */
  static checkContrast() {
    const elements = document.querySelectorAll('*');
    const issues = [];

    elements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const bgColor = style.backgroundColor;
      const color = style.color;

      const contrast = this.calculateContrast(bgColor, color);
      if (contrast < 4.5) {
        issues.push({
          type: 'low-contrast',
          element,
          contrast,
          message: `Contrast ratio is ${contrast.toFixed(2)}:1 (minimum 4.5:1)`
        });
      }
    });

    return issues;
  }

  /**
   * Calculate contrast ratio
   */
  static calculateContrast(bgColor, fgColor) {
    const getLuminance = (color) => {
      // Simplified luminance calculation
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;

      const [r, g, b] = rgb.map(x => parseInt(x) / 255);
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      return luminance;
    };

    const bgLuminance = getLuminance(bgColor);
    const fgLuminance = getLuminance(fgColor);

    const lighter = Math.max(bgLuminance, fgLuminance);
    const darker = Math.min(bgLuminance, fgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Run full audit
   */
  static audit() {
    return {
      images: this.checkImages(),
      headings: this.checkHeadings(),
      formLabels: this.checkFormLabels(),
      contrast: this.checkContrast()
    };
  }

  /**
   * Report issues
   */
  static reportIssues(audit) {
    const allIssues = [
      ...audit.images,
      ...audit.headings,
      ...audit.formLabels,
      ...audit.contrast
    ];

    console.table(allIssues.map(issue => ({
      type: issue.type,
      message: issue.message,
      element: issue.element.tagName
    })));

    return allIssues;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AccessibilityManager,
    AccessibilityChecker
  };
}
