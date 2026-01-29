/**
 * Analytics Integration Example
 * Track user events and app usage
 */

async function setupAnalytics(analyticsTracker) {
  // Track page view
  analyticsTracker.trackPageView(window.location.pathname);

  // Track user action
  analyticsTracker.trackEvent('app_open', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });

  // Track check-in event
  const checkinBtn = document.getElementById('checkin-btn');
  if (checkinBtn) {
    checkinBtn.addEventListener('click', () => {
      analyticsTracker.trackEvent('checkin_clicked', {
        timestamp: new Date().toISOString()
      });
    });
  }

  // Track wallet connection
  const connectWalletBtn = document.getElementById('connect-wallet-btn');
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', () => {
      analyticsTracker.trackEvent('wallet_connect_clicked', {
        timestamp: new Date().toISOString()
      });
    });
  }

  // Track theme changes
  document.addEventListener('theme-changed', (e) => {
    analyticsTracker.trackEvent('theme_changed', {
      newTheme: e.detail.theme,
      timestamp: new Date().toISOString()
    });
  });

  console.log('✅ Analytics setup complete');
}

/**
 * Get analytics summary
 */
function getAnalyticsSummary(analyticsTracker) {
  const summary = {
    totalEvents: analyticsTracker.events.length,
    pageViews: analyticsTracker.events.filter(e => e.type === 'page_view').length,
    checkins: analyticsTracker.events.filter(e => e.name === 'checkin_clicked').length,
    walletConnects: analyticsTracker.events.filter(e => e.name === 'wallet_connect_clicked').length,
    transactions: analyticsTracker.events.filter(e => e.name === 'transaction').length,
    errors: analyticsTracker.events.filter(e => e.name === 'error').length,
    sessionDuration: analyticsTracker.getSessionDuration(),
    topEvents: analyticsTracker.getTopEvents(5)
  };

  return summary;
}

/**
 * Export analytics data
 */
async function exportAnalyticsData(analyticsTracker) {
  const summary = getAnalyticsSummary(analyticsTracker);
  const data = JSON.stringify({
    exportDate: new Date().toISOString(),
    summary,
    events: analyticsTracker.events
  }, null, 2);

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log('✅ Analytics exported');
}

/**
 * Dashboard widget
 */
function createAnalyticsDashboard(analyticsTracker) {
  const dashboard = document.createElement('div');
  dashboard.className = 'analytics-dashboard';
  dashboard.innerHTML = `
    <div class="analytics-container">
      <h3>Analytics Dashboard</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <h4>Total Events</h4>
          <p class="stat-value" id="total-events">0</p>
        </div>
        <div class="stat-card">
          <h4>Check-ins</h4>
          <p class="stat-value" id="total-checkins">0</p>
        </div>
        <div class="stat-card">
          <h4>Session Duration</h4>
          <p class="stat-value" id="session-duration">0m</p>
        </div>
        <div class="stat-card">
          <h4>Errors</h4>
          <p class="stat-value" id="error-count">0</p>
        </div>
      </div>
      <button id="export-analytics">Export Analytics</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .analytics-dashboard {
      padding: 20px;
      background: rgba(212, 165, 116, 0.05);
      border-radius: 10px;
      margin: 20px 0;
    }

    .analytics-container h3 {
      margin-bottom: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #d4af37;
    }

    .stat-card h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #b0b0b0;
    }

    .stat-value {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #d4af37;
    }

    #export-analytics {
      padding: 10px 20px;
      background: #d4af37;
      color: #000;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    }

    #export-analytics:hover {
      background: #e5b850;
    }
  `;
  document.head.appendChild(style);

  // Update stats
  function updateStats() {
    const summary = getAnalyticsSummary(analyticsTracker);
    document.getElementById('total-events').textContent = summary.totalEvents;
    document.getElementById('total-checkins').textContent = summary.checkins;
    document.getElementById('error-count').textContent = summary.errors;

    const minutes = Math.floor(summary.sessionDuration / 60000);
    document.getElementById('session-duration').textContent = `${minutes}m`;
  }

  // Update every 10 seconds
  setInterval(updateStats, 10000);
  updateStats();

  // Export button
  document.querySelector('#export-analytics').addEventListener('click', () => {
    exportAnalyticsData(analyticsTracker);
  });

  return dashboard;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setupAnalytics,
    getAnalyticsSummary,
    exportAnalyticsData,
    createAnalyticsDashboard
  };
}
