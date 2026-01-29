/**
 * Date & Time Utilities
 * Advanced date and time manipulation
 */

class DateTimeUtils {
  /**
   * Format date
   */
  static format(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Get relative time
   */
  static getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.format(date);
  }

  /**
   * Add days
   */
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add hours
   */
  static addHours(date, hours) {
    return new Date(date.getTime() + hours * 3600000);
  }

  /**
   * Get day of week
   */
  static getDayOfWeek(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(date).getDay()];
  }

  /**
   * Is today
   */
  static isToday(date) {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  }

  /**
   * Is this week
   */
  static isThisWeek(date) {
    const d = new Date(date);
    const now = new Date();
    const dayDiff = now.getDay() - d.getDay();
    return dayDiff >= 0 && dayDiff < 7;
  }

  /**
   * Get week number
   */
  static getWeekNumber(date) {
    const d = new Date(Date.UTC(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Get days in month
   */
  static getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Get start of day
   */
  static getStartOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Get end of day
   */
  static getEndOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * Get time until
   */
  static getTimeUntil(date) {
    const diff = new Date(date) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateTimeUtils;
}
