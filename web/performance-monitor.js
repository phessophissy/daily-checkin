/**
 * Performance Monitoring
 * Real-time performance tracking and metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.observers = [];
    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    this.observePageMetrics();
    this.observeLongTasks();
    this.observeLayoutShift();
    this.setupNetworkMonitoring();
  }

  /**
   * Observe page load metrics
   */
  observePageMetrics() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            type: 'page-load',
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });

      observer.observe({ entryTypes: ['navigation', 'resource'] });
      this.observers.push(observer);
    }
  }

  /**
   * Observe long tasks
   */
  observeLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              type: 'long-task',
              duration: entry.duration,
              attribution: entry.attribution?.[0]?.name
            });
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (error) {
        console.warn('Long task monitoring not supported');
      }
    }
  }

  /**
   * Observe layout shifts
   */
  observeLayoutShift() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric({
              type: 'cumulative-layout-shift',
              value: clsValue
            });
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    }
  }

  /**
   * Setup network monitoring
   */
  setupNetworkMonitoring() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            type: 'network',
            name: entry.name,
            method: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize,
            status: entry.transferSize === 0 ? 'cached' : 'transferred'
          });
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  /**
   * Record custom metric
   */
  recordMetric(metric) {
    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    });
  }

  /**
   * Get Web Vitals
   */
  getWebVitals() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      // FCP - First Contentful Paint
      fcp: paint.find(e => e.name === 'first-contentful-paint')?.startTime,
      // LCP - Largest Contentful Paint
      lcp: this.getLCP(),
      // CLS - Cumulative Layout Shift
      cls: this.getCLS(),
      // FID - First Input Delay (deprecated, use INP)
      fid: this.getFID(),
      // TTL - Time to Load
      ttl: navigation?.loadEventEnd - navigation?.fetchStart,
      // DNS Lookup
      dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
      // TCP Connection
      tcp: navigation?.connectEnd - navigation?.connectStart,
      // Time to First Byte
      ttfb: navigation?.responseStart - navigation?.requestStart,
      // DOM Content Loaded
      dcl: navigation?.domContentLoadedEventEnd - navigation?.fetchStart,
      // Load Complete
      load: navigation?.loadEventEnd - navigation?.fetchStart
    };
  }

  /**
   * Get LCP
   */
  getLCP() {
    let lcp = 0;
    const paint = performance.getEntriesByType('largest-contentful-paint');
    for (const entry of paint) {
      lcp = entry.renderTime || entry.loadTime;
    }
    return lcp;
  }

  /**
   * Get CLS
   */
  getCLS() {
    let cls = 0;
    const shifts = performance.getEntriesByType('layout-shift');
    for (const entry of shifts) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }
    return cls;
  }

  /**
   * Get FID
   */
  getFID() {
    const interactions = performance.getEntriesByType('first-input');
    return interactions[0]?.processingDuration || 0;
  }

  /**
   * Get performance report
   */
  getReport() {
    const vitals = this.getWebVitals();
    const avgDuration = this.metrics.length > 0
      ? this.metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / this.metrics.length
      : 0;

    return {
      vitals,
      metrics: this.metrics,
      summary: {
        totalMetrics: this.metrics.length,
        averageDuration: avgDuration,
        byType: this.getMetricsByType(),
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Get metrics by type
   */
  getMetricsByType() {
    const grouped = {};
    for (const metric of this.metrics) {
      if (!grouped[metric.type]) {
        grouped[metric.type] = [];
      }
      grouped[metric.type].push(metric);
    }
    return grouped;
  }

  /**
   * Export performance report
   */
  exportReport() {
    const report = this.getReport();
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics = [];
  }

  /**
   * Destroy
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}
