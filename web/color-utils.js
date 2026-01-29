/**
 * Color Utilities
 * Color manipulation and conversion
 */

class ColorUtils {
  /**
   * Convert hex to RGB
   */
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  /**
   * Convert hex to HSL
   */
  static hexToHsl(hex) {
    const rgb = this.hexToRgb(hex);
    return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
  }

  /**
   * Convert RGB to HSL
   */
  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  /**
   * Lighten color
   */
  static lighten(hex, amount = 20) {
    const hsl = this.hexToHsl(hex);
    hsl.l = Math.min(100, hsl.l + amount);
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  /**
   * Darken color
   */
  static darken(hex, amount = 20) {
    const hsl = this.hexToHsl(hex);
    hsl.l = Math.max(0, hsl.l - amount);
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  /**
   * Convert HSL to hex
   */
  static hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  /**
   * Get contrast color (black or white)
   */
  static getContrastColor(hex) {
    const rgb = this.hexToRgb(hex);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  /**
   * Generate color palette
   */
  static generatePalette(baseHex, steps = 5) {
    const colors = [];
    const hsl = this.hexToHsl(baseHex);
    const step = 100 / (steps + 1);

    for (let i = 1; i <= steps; i++) {
      colors.push(this.hslToHex(hsl.h, hsl.s, step * i));
    }

    return colors;
  }

  /**
   * Interpolate colors
   */
  static interpolate(color1, color2, factor = 0.5) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

    return this.rgbToHex(r, g, b);
  }

  /**
   * Convert color to RGBA
   */
  static toRgba(hex, alpha = 1) {
    const rgb = this.hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColorUtils;
}
