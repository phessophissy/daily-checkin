# Daily Checkin - Frontend Documentation

## Overview

Daily Checkin is a decentralized daily check-in system built on the Stacks blockchain. Users can check in daily to earn rewards using their Stacks wallet.

## Project Structure

```
web/
├── index-metallic.html      # Main HTML template with metallic theme
├── app-metallic.js          # Main application logic
├── config.js                # Configuration constants
├── utils.js                 # Utility functions
├── api.js                   # HTTP client and API services
├── managers.js              # State, theme, logger managers
├── components.js            # Reusable UI components
├── dialogs.js               # Notification and modal managers
├── forms.js                 # Form validation and analytics
├── routing.js               # Client-side router and security
├── services.js              # Business logic services
├── i18n.js                  # Internationalization
├── lib/
│   ├── wallet-integration.js    # @stacks/connect integration
│   └── transaction-handler.js   # @stacks/transactions integration
├── styles/
│   ├── metallic-theme.css       # Core theme styles
│   ├── components.css           # Component-specific styles
│   └── layout.css               # Layout and animations
└── deployment-config.js     # Build and deployment config
```

## Key Features

### 1. Metallic Theme
- Premium golden and silver color scheme
- Glass-morphism effects
- Smooth animations and transitions
- Fully responsive design

### 2. Wallet Integration (@stacks/connect)
- Seamless wallet connection
- Multi-wallet support (Hiro, Xverse)
- User address management
- Network information retrieval

### 3. Blockchain Integration (@stacks/transactions)
- Transaction creation and signing
- Gas fee estimation
- Transaction broadcasting
- Real-time status tracking

### 4. State Management
- Centralized application state
- Observable state changes
- Middleware support
- State snapshots and restoration

### 5. Services Architecture
- Data fetching with caching
- Check-in operations
- Wallet management
- Transaction monitoring

### 6. Form Validation
- Built-in validation rules
- Real-time error display
- Custom validators
- Form data serialization

### 7. Analytics Tracking
- Event tracking system
- User action monitoring
- Error reporting
- Session analytics

### 8. Internationalization (i18n)
- Multi-language support
- English and Spanish translations
- Currency and date formatting
- Easy language switching

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deploy

```bash
npm run deploy
```

## Configuration

Edit `.env` to configure:

```env
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://stacks-testnet-api.herokuapp.com
VITE_CONTRACT_DEPLOYER=SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09
VITE_CONTRACT_NAME=daily-checkin
VITE_CHECKIN_FEE=0.001
```

## Core Components

### DailyCheckinApp
Main application class handling UI coordination and wallet integration.

```javascript
const app = new DailyCheckinApp();
```

### StacksWalletIntegration
Handles wallet connection using @stacks/connect.

```javascript
const wallet = new StacksWalletIntegration({ appDetails });
await wallet.connectWallet();
```

### DailyCheckinTransaction
Creates and broadcasts check-in transactions using @stacks/transactions.

```javascript
const tx = await transactionHandler.createCheckInTransaction(options);
await transactionHandler.broadcastCheckInTransaction(tx);
```

### State Management
Centralized application state with observers.

```javascript
appState.setState({ wallet: { connected: true } });
appState.subscribe(callback);
```

### Services
Business logic services for data and operations.

```javascript
const checkinService = new CheckinService(api, contract);
const userData = await checkinService.getCheckinData(address);
```

## API Integration

### StacksApiService

```javascript
// Get account balance
const balance = await apiService.getBalance(address);

// Get transactions
const txs = await apiService.getTransactions(address);

// Broadcast transaction
const result = await apiService.broadcastTransaction(txHex);

// Call read-only function
const data = await apiService.callReadOnlyFunction(contractId, functionName);
```

## UI Components

### Built-in Components

- MetallicButton - Styled button with variants
- MetallicCard - Card container with header
- MetallicModal - Modal dialog with animations
- MetallicToast - Toast notifications
- MetallicInput - Form input field
- StatCard - Statistics display
- ProgressBar - Progress indicator
- Spinner - Loading spinner
- Tabs - Tabbed content

### Usage

```javascript
const button = new MetallicButton({
  text: 'Click Me',
  variant: 'primary',
  onClick: () => console.log('Clicked!')
});

const element = button.render();
document.body.appendChild(element);
```

## Styling

### Theme Colors

```css
--metallic-gold: #d4af37
--metallic-silver: #c0c0c0
--metallic-platinum: #e5e4e2
--metallic-copper: #b87333
--primary-dark: #1a1a1a
--primary-light: #2d2d2d
--accent-gold: #d4af37
```

### Animations

- fadeIn/fadeOut - Opacity transitions
- slideLeft/slideRight - Horizontal movement
- scaleIn - Scale up appearance
- glowPulse - Glow effect
- metalShine - Shimmer animation

## Security

### Built-in Security Features

- XSS prevention (HTML sanitization)
- URL validation
- Content Security Policy support
- Secure token generation
- Address validation

```javascript
const safe = SecurityManager.sanitizeHTML(html);
const token = SecurityManager.generateToken(32);
```

## Event System

### Event Bus

```javascript
// Subscribe to event
eventBus.on('checkin-success', (data) => {
  console.log('Checkin successful!', data);
});

// Emit event
eventBus.emit('checkin-success', { txid: '0x...' });
```

## Troubleshooting

### Wallet Connection Issues
- Ensure wallet extension is installed
- Check network configuration
- Verify wallet supports the network

### Transaction Failures
- Check wallet balance for fees
- Verify contract address
- Review transaction parameters

### Performance Issues
- Clear cache: `cache.clear()`
- Check network latency
- Review analytics for bottlenecks

## Contributing

See CONTRIBUTING.md for guidelines.

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [link]
- Discord Community: [link]
- Email: support@dailycheckin.dev
