/**
 * Theme Customization Example
 * Customize colors, animations, and styles
 */

function createCustomTheme(colors = {}) {
  const defaultColors = {
    primary: '#d4af37',
    secondary: '#c0c0c0',
    accent: '#e94560',
    background: '#0d0d0d',
    text: '#eaeaea',
    textSecondary: '#b0b0b0',
    success: '#4ade80',
    warning: '#facc15',
    error: '#ef4444'
  };

  const customColors = { ...defaultColors, ...colors };
  const style = document.createElement('style');

  style.textContent = `
    :root {
      --color-primary: ${customColors.primary};
      --color-secondary: ${customColors.secondary};
      --color-accent: ${customColors.accent};
      --color-background: ${customColors.background};
      --color-text: ${customColors.text};
      --color-text-secondary: ${customColors.textSecondary};
      --color-success: ${customColors.success};
      --color-warning: ${customColors.warning};
      --color-error: ${customColors.error};
    }
  `;

  document.head.appendChild(style);
  return customColors;
}

/**
 * Create animation variants
 */
function createAnimationTheme(duration = 300) {
  const style = document.createElement('style');

  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateX(-20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .animate-fade-in {
      animation: fadeIn ${duration}ms ease-in;
    }

    .animate-slide-in {
      animation: slideIn ${duration}ms ease-out;
    }

    .animate-scale-in {
      animation: scaleIn ${duration}ms ease-out;
    }

    .animate-bounce {
      animation: bounce ${duration}ms infinite;
    }

    .animate-pulse {
      animation: pulse ${duration}ms infinite;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Create typography theme
 */
function createTypographyTheme(config = {}) {
  const defaults = {
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '16px',
    fontWeightNormal: 400,
    fontWeightBold: 600,
    lineHeight: 1.5,
    letterSpacing: '0.5px'
  };

  const typography = { ...defaults, ...config };
  const style = document.createElement('style');

  style.textContent = `
    body {
      font-family: ${typography.fontFamily};
      font-size: ${typography.fontSize};
      font-weight: ${typography.fontWeightNormal};
      line-height: ${typography.lineHeight};
      letter-spacing: ${typography.letterSpacing};
    }

    h1, h2, h3, h4, h5, h6 {
      font-weight: ${typography.fontWeightBold};
    }

    h1 { font-size: ${parseInt(typography.fontSize) * 2}px; }
    h2 { font-size: ${parseInt(typography.fontSize) * 1.75}px; }
    h3 { font-size: ${parseInt(typography.fontSize) * 1.5}px; }
    h4 { font-size: ${parseInt(typography.fontSize) * 1.25}px; }
    h5 { font-size: ${parseInt(typography.fontSize) * 1.1}px; }
    h6 { font-size: ${typography.fontSize}; }

    button, .btn {
      font-weight: ${typography.fontWeightBold};
    }
  `;

  document.head.appendChild(style);
  return typography;
}

/**
 * Create spacing theme
 */
function createSpacingTheme(baseUnit = '8px') {
  const sizes = {
    'xs': `calc(${baseUnit} * 0.5)`,
    'sm': baseUnit,
    'md': `calc(${baseUnit} * 2)`,
    'lg': `calc(${baseUnit} * 3)`,
    'xl': `calc(${baseUnit} * 4)`,
    '2xl': `calc(${baseUnit} * 5)`
  };

  const style = document.createElement('style');
  let css = ':root {\n';

  Object.entries(sizes).forEach(([name, value]) => {
    css += `  --spacing-${name}: ${value};\n`;
  });

  css += '}';
  style.textContent = css;
  document.head.appendChild(style);

  return sizes;
}

/**
 * Create border radius theme
 */
function createBorderRadiusTheme(config = {}) {
  const defaults = {
    'none': '0',
    'sm': '2px',
    'md': '4px',
    'lg': '8px',
    'xl': '12px',
    'full': '9999px'
  };

  const radii = { ...defaults, ...config };
  const style = document.createElement('style');
  let css = ':root {\n';

  Object.entries(radii).forEach(([name, value]) => {
    css += `  --radius-${name}: ${value};\n`;
  });

  css += '}';
  style.textContent = css;
  document.head.appendChild(style);

  return radii;
}

/**
 * Create shadow theme
 */
function createShadowTheme(config = {}) {
  const defaults = {
    'sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
    'md': '0 4px 6px rgba(0, 0, 0, 0.15)',
    'lg': '0 10px 15px rgba(0, 0, 0, 0.2)',
    'xl': '0 20px 25px rgba(0, 0, 0, 0.25)',
    'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const shadows = { ...defaults, ...config };
  const style = document.createElement('style');
  let css = ':root {\n';

  Object.entries(shadows).forEach(([name, value]) => {
    css += `  --shadow-${name}: ${value};\n`;
  });

  css += '}';
  style.textContent = css;
  document.head.appendChild(style);

  return shadows;
}

/**
 * Theme builder
 */
class ThemeBuilder {
  constructor() {
    this.colors = {};
    this.typography = {};
    this.spacing = {};
    this.borderRadius = {};
    this.shadows = {};
  }

  setColors(colors) {
    this.colors = colors;
    createCustomTheme(colors);
    return this;
  }

  setTypography(typography) {
    this.typography = typography;
    createTypographyTheme(typography);
    return this;
  }

  setSpacing(baseUnit) {
    this.spacing = createSpacingTheme(baseUnit);
    return this;
  }

  setBorderRadius(radii) {
    this.borderRadius = radii;
    createBorderRadiusTheme(radii);
    return this;
  }

  setShadows(shadows) {
    this.shadows = shadows;
    createShadowTheme(shadows);
    return this;
  }

  setAnimations(duration) {
    createAnimationTheme(duration);
    return this;
  }

  build() {
    return {
      colors: this.colors,
      typography: this.typography,
      spacing: this.spacing,
      borderRadius: this.borderRadius,
      shadows: this.shadows
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createCustomTheme,
    createAnimationTheme,
    createTypographyTheme,
    createSpacingTheme,
    createBorderRadiusTheme,
    createShadowTheme,
    ThemeBuilder
  };
}
