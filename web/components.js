/**
 * Metallic UI Components
 * Reusable Vue-like component classes for building the metallic UI
 */

// Button Component
class MetallicButton {
  constructor(options = {}) {
    this.text = options.text || 'Button';
    this.variant = options.variant || 'secondary'; // 'primary' | 'secondary'
    this.disabled = options.disabled || false;
    this.onClick = options.onClick || null;
  }

  render() {
    const btn = document.createElement('button');
    btn.className = `btn ${this.variant === 'primary' ? 'btn-primary' : ''}`;
    btn.textContent = this.text;
    btn.disabled = this.disabled;

    if (this.onClick) {
      btn.addEventListener('click', this.onClick);
    }

    return btn;
  }
}

// Card Component
class MetallicCard {
  constructor(options = {}) {
    this.title = options.title || '';
    this.content = options.content || '';
    this.footer = options.footer || '';
  }

  render() {
    const card = document.createElement('div');
    card.className = 'card';

    if (this.title) {
      const header = document.createElement('div');
      header.className = 'card-header';
      header.innerHTML = `<h3 class="card-title">${this.title}</h3>`;
      card.appendChild(header);
    }

    if (this.content) {
      const contentEl = document.createElement('div');
      contentEl.innerHTML = this.content;
      card.appendChild(contentEl);
    }

    if (this.footer) {
      const footerEl = document.createElement('div');
      footerEl.innerHTML = this.footer;
      card.appendChild(footerEl);
    }

    return card;
  }
}

// Badge Component
class MetallicBadge {
  constructor(options = {}) {
    this.text = options.text || 'Badge';
    this.variant = options.variant || 'primary'; // 'primary' | 'secondary'
  }

  render() {
    const badge = document.createElement('span');
    badge.className = `badge ${this.variant === 'secondary' ? 'badge-secondary' : ''}`;
    badge.textContent = this.text;
    return badge;
  }
}

// Stats Card Component
class StatCard {
  constructor(options = {}) {
    this.label = options.label || 'Stat';
    this.value = options.value || '0';
  }

  render() {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <p class="stat-label">${this.label}</p>
      <p class="stat-value">${this.value}</p>
    `;
    return card;
  }
}

// Modal Component
class MetallicModal {
  constructor(options = {}) {
    this.title = options.title || 'Modal';
    this.content = options.content || '';
    this.onClose = options.onClose || null;
    this.isOpen = false;
  }

  open() {
    if (this.isOpen) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    const titleEl = document.createElement('h2');
    titleEl.style.marginTop = '0';
    titleEl.textContent = this.title;

    const contentEl = document.createElement('div');
    contentEl.innerHTML = this.content;

    modal.appendChild(closeBtn);
    modal.appendChild(titleEl);
    modal.appendChild(contentEl);
    
    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    document.body.appendChild(overlay);

    this.overlay = overlay;
    this.isOpen = true;
  }

  close() {
    if (this.overlay) {
      this.overlay.remove();
      this.isOpen = false;
      if (this.onClose) this.onClose();
    }
  }
}

// Toast Notification Component
class MetallicToast {
  constructor(options = {}) {
    this.message = options.message || 'Notification';
    this.type = options.type || 'info'; // 'info' | 'success' | 'error'
    this.duration = options.duration || 5000;
  }

  show() {
    const toast = document.createElement('div');
    toast.className = `toast ${this.type}`;
    toast.textContent = this.message;

    const container = document.getElementById('notifications-container') || document.body;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, this.duration);

    return toast;
  }
}

// Input Field Component
class MetallicInput {
  constructor(options = {}) {
    this.label = options.label || '';
    this.placeholder = options.placeholder || '';
    this.type = options.type || 'text';
    this.value = options.value || '';
    this.error = options.error || false;
    this.onChange = options.onChange || null;
  }

  render() {
    const group = document.createElement('div');
    group.className = 'input-group';

    if (this.label) {
      const labelEl = document.createElement('label');
      labelEl.className = 'input-label';
      labelEl.textContent = this.label;
      group.appendChild(labelEl);
    }

    const input = document.createElement('input');
    input.type = this.type;
    input.className = `input-field ${this.error ? 'error' : ''}`;
    input.placeholder = this.placeholder;
    input.value = this.value;

    if (this.onChange) {
      input.addEventListener('change', (e) => this.onChange(e.target.value));
    }

    group.appendChild(input);
    return group;
  }
}

// Feature Item Component
class FeatureItem {
  constructor(options = {}) {
    this.icon = options.icon || '✨';
    this.title = options.title || 'Feature';
    this.description = options.description || '';
  }

  render() {
    const item = document.createElement('div');
    item.className = 'feature-item';
    item.innerHTML = `
      <div class="feature-icon">${this.icon}</div>
      <h3 class="feature-title">${this.title}</h3>
      <p>${this.description}</p>
    `;
    return item;
  }
}

// Progress Bar Component
class ProgressBar {
  constructor(options = {}) {
    this.progress = options.progress || 0; // 0-100
  }

  render() {
    const container = document.createElement('div');
    container.className = 'progress-bar';

    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.style.width = `${Math.min(100, Math.max(0, this.progress))}%`;

    container.appendChild(fill);
    return container;
  }

  update(progress) {
    this.progress = progress;
    const fill = this.render().querySelector('.progress-fill');
    if (fill) {
      fill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  }
}

// Tabs Component
class Tabs {
  constructor(options = {}) {
    this.tabs = options.tabs || []; // [{ label, content }, ...]
    this.activeIndex = options.activeIndex || 0;
    this.onChange = options.onChange || null;
  }

  render() {
    const container = document.createElement('div');

    const tabButtons = document.createElement('div');
    tabButtons.className = 'tabs-container';

    this.tabs.forEach((tab, index) => {
      const btn = document.createElement('button');
      btn.className = `tab-button ${index === this.activeIndex ? 'active' : ''}`;
      btn.textContent = tab.label;
      btn.addEventListener('click', () => this.setActive(index));
      tabButtons.appendChild(btn);
    });

    const content = document.createElement('div');
    if (this.tabs[this.activeIndex]) {
      content.innerHTML = this.tabs[this.activeIndex].content;
    }

    container.appendChild(tabButtons);
    container.appendChild(content);
    container.contentDiv = content;
    container.buttons = Array.from(tabButtons.querySelectorAll('.tab-button'));

    this.container = container;
    return container;
  }

  setActive(index) {
    if (index === this.activeIndex) return;

    this.activeIndex = index;

    if (this.container) {
      this.container.buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });

      const contentDiv = this.container.contentDiv;
      if (contentDiv && this.tabs[index]) {
        contentDiv.innerHTML = this.tabs[index].content;
      }
    }

    if (this.onChange) {
      this.onChange(index);
    }
  }
}

// List Component
class MetallicList {
  constructor(options = {}) {
    this.items = options.items || []; // [{ label, value }, ...]
    this.onItemClick = options.onItemClick || null;
  }

  render() {
    const list = document.createElement('ul');
    list.className = 'list';

    this.items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `
        <span>${item.label}</span>
        <span style="color: #d4af37; font-weight: 600;">${item.value}</span>
      `;

      if (this.onItemClick) {
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => this.onItemClick(index, item));
      }

      list.appendChild(li);
    });

    return list;
  }
}

// Spinner Component
class Spinner {
  constructor(options = {}) {
    this.size = options.size || 'medium'; // 'small' | 'medium' | 'large'
  }

  render() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    if (this.size === 'small') {
      spinner.style.width = '16px';
      spinner.style.height = '16px';
      spinner.style.borderWidth = '2px';
    } else if (this.size === 'large') {
      spinner.style.width = '40px';
      spinner.style.height = '40px';
      spinner.style.borderWidth = '4px';
    }

    return spinner;
  }
}

// Divider Component
class Divider {
  render() {
    return document.createElement('div').setAttribute('class', 'divider');
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MetallicButton,
    MetallicCard,
    MetallicBadge,
    StatCard,
    MetallicModal,
    MetallicToast,
    MetallicInput,
    FeatureItem,
    ProgressBar,
    Tabs,
    MetallicList,
    Spinner,
    Divider
  };
}
