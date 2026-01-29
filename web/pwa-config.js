/**
 * Web App Manifest Configuration
 * Progressive Web App configuration
 */

const manifest = {
  "name": "Daily Check-in",
  "short_name": "Check-in",
  "description": "Track your daily check-ins and earn rewards on the Stacks blockchain",
  "scope": "/",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0d0d0d",
  "theme_color": "#d4af37",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshot-2.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "categories": ["productivity", "finance"],
  "shortcuts": [
    {
      "name": "Check In",
      "short_name": "Check In",
      "description": "Perform a daily check-in",
      "url": "/?action=checkin",
      "icons": [
        {
          "src": "/icon-checkin.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "View Streak",
      "short_name": "Streak",
      "description": "View your current streak",
      "url": "/?action=streak",
      "icons": [
        {
          "src": "/icon-streak.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "application/x-www-form-urlencoded",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  },
  "prefer_related_applications": false
};

// Generate manifest file
if (typeof module !== 'undefined' && module.exports) {
  module.exports = manifest;
}

// Alternative: Serve manifest
function serveManifest() {
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = 'data:application/manifest+json;utf-8,' + encodeURIComponent(JSON.stringify(manifest));
  document.head.appendChild(link);
}

// Service Worker Registration
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Failed to register Service Worker:', error);
    }
  }
}

// Web App Install Prompt
class InstallPrompt {
  static async init() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      const installBtn = document.getElementById('install-btn');
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
          });
        });
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed');
      const installBtn = document.getElementById('install-btn');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
    });
  }
}

// Offline Page
const offlineHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline</title>
  <style>
    body {
      font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%);
      color: #eaeaea;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 500px;
    }
    h1 {
      font-size: 48px;
      margin: 0 0 20px 0;
      color: #d4af37;
    }
    p {
      font-size: 18px;
      color: #b0b0b0;
      margin: 10px 0;
    }
    .emoji {
      font-size: 80px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="emoji">📡</div>
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection.</p>
    <p>Please check your connection and try again.</p>
    <p style="margin-top: 30px; color: #888; font-size: 14px;">
      Some features may be available in offline mode.
    </p>
  </div>
</body>
</html>
`;

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    manifest,
    registerServiceWorker,
    InstallPrompt,
    offlineHTML
  };
}
