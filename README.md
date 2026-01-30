# Daily Check-in - Stacks Blockchain dApp

A daily check-in points system on the Stacks blockchain with STX fee collection and streak bonuses. Built with @stacks/connect for wallet integration and @stacks/transactions for blockchain interactions.

**Contract Deployer:** `SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09`  
**Network:** Stacks Mainnet  
**Fee:** 0.001 STX (1000 microSTX) per check-in  
**Explorer:** https://explorer.stacks.co

---

## Features

✅ **Daily Check-ins** - Users can check in once every 24 hours (144 blocks)  
✅ **Points System** - Earn 100 base points + streak bonuses per check-in  
✅ **Streak Tracking** - Consecutive check-ins within 48 hours earn extra points  
✅ **Fee Collection** - 0.001 STX collected per check-in  
✅ **@stacks/connect Integration** - Secure wallet connections with Hiro Wallet  
✅ **@stacks/transactions Support** - Direct blockchain interactions and contract calls  
✅ **Metallic Theme UI** - Beautiful dark-themed interface with gold and silver accents  
✅ **Offline Support** - PWA with service worker for offline functionality  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Smart Contract** | Clarity (Stacks) | - |
| **Wallet Integration** | @stacks/connect | 7.7.0 |
| **Transactions** | @stacks/transactions | 6.13.0 |
| **Auth** | @stacks/auth | - |
| **Frontend** | TypeScript/JavaScript | - |
| **Bundler** | Vite | - |
| **Styling** | CSS3 (Metallic Theme) | - |
| **Storage** | IndexedDB | - |
| **PWA** | Service Workers | - |

---

## Installation

### Prerequisites

- Node.js >= 16.x
- npm or yarn
- [Hiro Wallet](https://www.hiro.so/wallet) (for testing)
- Stacks Mainnet STX (for deployment and testing)

### Setup

```bash
# Clone the repository
git clone https://github.com/phessophissy/daily-checkin.git
cd daily-checkin

# Install dependencies
npm install

# Install Hiro Clarinet (optional, for local testing)
npm install -g @hirosystems/clarinet

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Smart Contract Overview

Located at: `contracts/daily-checkin.clar`

### Contract Address
```
SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.daily-checkin
```

### Public Functions

#### `check-in`
Perform a daily check-in and earn points.

```clarity
(check-in)
```

**Returns:**
```clarity
{
  earned: uint,              ;; Points earned this check-in
  total-points: uint,        ;; User's cumulative points
  streak: uint,              ;; Current streak count
  total-checkins: uint,      ;; Lifetime check-ins
  fee-paid: uint             ;; Fee paid (1000 microSTX)
}
```

**Cost:** 0.001 STX (1000 microSTX) + Network fees

### Read-Only Functions

#### `get-user-stats (principal)`
Get complete user statistics.

```clarity
(get-user-stats user-address)
```

**Returns:**
```clarity
{
  points: uint,
  streak: uint,
  total-checkins: uint,
  last-checkin: uint,
  fee-paid: uint,
  can-checkin: bool
}
```

#### `get-user-points (principal)`
Get user's total points.

```clarity
(get-user-points user-address) => uint
```

#### `get-user-streak (principal)`
Get user's current streak.

```clarity
(get-user-streak user-address) => uint
```

#### `can-checkin (principal)`
Check if user can perform a check-in now.

```clarity
(can-checkin user-address) => bool
```

#### `get-global-stats`
Get global statistics.

```clarity
(get-global-stats)
```

**Returns:**
```clarity
{
  total-checkins: uint,
  unique-users: uint,
  points-per-checkin: uint,
  streak-bonus: uint,
  fee-amount: uint,
  contract-deployer: principal
}
```

---

## Frontend Integration Guide

### 1. Wallet Connection with @stacks/connect

#### Setup User Session

```javascript
import { AppConfig, UserSession } from '@stacks/auth';

// Create app configuration
const appConfig = new AppConfig(
  ['store_write', 'publish_data'],  // Scopes
  window.location.origin              // App URL
);

// Create user session
export const userSession = new UserSession({ appConfig });
```

#### Connect Wallet

```javascript
import { showConnect } from '@stacks/connect';
import { userSession } from './auth-config';

export function connectWallet() {
  return showConnect({
    appDetails: {
      name: 'Daily Check-in',
      icon: window.location.origin + '/logo.svg',
    },
    redirectTo: '/',
    onFinish: () => {
      console.log('User connected:', getUserAddress());
      // Redirect or reload app
      window.location.reload();
    },
    onCancel: () => {
      console.log('User cancelled connection');
    },
    userSession,
  });
}
```

#### Get User Address

```javascript
export function getUserAddress() {
  if (!userSession.isUserSignedIn()) {
    return null;
  }
  
  const userData = userSession.loadUserData();
  return userData.profile.stxAddress.mainnet;
}

export function isConnected() {
  return userSession.isUserSignedIn();
}
```

#### Disconnect Wallet

```javascript
export function disconnectWallet() {
  userSession.signUserOut();
  window.location.reload();
}
```

---

### 2. Contract Interactions with @stacks/transactions

#### Read User Data (Read-Only Call)

```javascript
import {
  callReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/transactions';

const CONTRACT_ADDRESS = 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09';
const CONTRACT_NAME = 'daily-checkin';

export async function getUserPoints(userAddress) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-points',
      functionArgs: [standardPrincipalCV(userAddress)],
      network: new StacksMainnet(),
    });

    const value = cvToJSON(result);
    return parseInt(value.value);
  } catch (error) {
    console.error('Failed to get user points:', error);
    return 0;
  }
}

export async function getUserStats(userAddress) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-stats',
      functionArgs: [standardPrincipalCV(userAddress)],
      network: new StacksMainnet(),
    });

    const stats = cvToJSON(result).value;
    return {
      points: parseInt(stats.points.value),
      streak: parseInt(stats.streak.value),
      totalCheckins: parseInt(stats['total-checkins'].value),
      lastCheckin: parseInt(stats['last-checkin'].value),
      canCheckIn: stats['can-checkin'].value === 'true',
      feePaid: parseInt(stats['fee-paid'].value),
    };
  } catch (error) {
    console.error('Failed to get user stats:', error);
    throw error;
  }
}

export async function getGlobalStats() {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-global-stats',
      network: new StacksMainnet(),
    });

    const stats = cvToJSON(result).value;
    return {
      totalCheckins: parseInt(stats['total-checkins'].value),
      uniqueUsers: parseInt(stats['unique-users'].value),
      pointsPerCheckin: parseInt(stats['points-per-checkin'].value),
      streakBonus: parseInt(stats['streak-bonus'].value),
      feeAmount: parseInt(stats['fee-amount'].value),
    };
  } catch (error) {
    console.error('Failed to get global stats:', error);
    throw error;
  }
}
```

#### Perform Check-in (Contract Call via Wallet)

```javascript
import {
  openContractCall,
} from '@stacks/connect';
import { StacksMainnet } from '@stacks/transactions';
import { userSession } from './auth-config';

export async function performCheckIn() {
  try {
    return openContractCall({
      contractAddress: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
      contractName: 'daily-checkin',
      functionName: 'check-in',
      functionArgs: [],
      appDetails: {
        name: 'Daily Check-in',
        icon: window.location.origin + '/logo.svg',
      },
      network: new StacksMainnet(),
      onFinish: (response) => {
        console.log('Transaction submitted:', response.txId);
        // Poll for confirmation
        monitorTransaction(response.txId);
      },
      onCancel: () => {
        console.log('User cancelled transaction');
      },
      userSession,
    });
  } catch (error) {
    console.error('Check-in failed:', error);
    throw error;
  }
}
```

#### Monitor Transaction Status

```javascript
import { StacksMainnet } from '@stacks/transactions';

export async function monitorTransaction(txId, maxAttempts = 30) {
  const network = new StacksMainnet();
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(
          `${network.getApiUrl()}/v2/transactions/${txId}`
        );
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const tx = await response.json();
        console.log(`Transaction ${txId} status:`, tx.tx_status);

        if (tx.tx_status === 'success') {
          console.log('✅ Transaction confirmed!');
          resolve(tx);
        } else if (tx.tx_status === 'failed' || tx.tx_status === 'abort_by_response') {
          reject(new Error(`Transaction failed: ${tx.tx_error_code}`));
        } else if (++attempts < maxAttempts) {
          // Retry after 10 seconds
          setTimeout(checkStatus, 10000);
        } else {
          reject(new Error('Transaction monitoring timeout'));
        }
      } catch (error) {
        console.error('Failed to check transaction status:', error);
        if (++attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        } else {
          reject(error);
        }
      }
    };

    checkStatus();
  });
}
```

---

### 3. Complete Check-in Component Example

```javascript
import {
  connectWallet,
  disconnectWallet,
  getUserAddress,
  isConnected,
} from './wallet';
import {
  performCheckIn,
  getUserStats,
  getGlobalStats,
  monitorTransaction,
} from './transactions';

export class CheckInApp {
  constructor() {
    this.userAddress = null;
    this.userStats = null;
    this.globalStats = null;
    this.isCheckingIn = false;
  }

  async init() {
    if (isConnected()) {
      this.userAddress = getUserAddress();
      await this.loadData();
    }
    this.render();
  }

  async loadData() {
    if (!this.userAddress) return;

    try {
      [this.userStats, this.globalStats] = await Promise.all([
        getUserStats(this.userAddress),
        getGlobalStats(),
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load user data. Please try again.');
    }
  }

  async handleConnect() {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  }

  async handleCheckIn() {
    if (!this.userAddress || this.isCheckingIn) return;

    this.isCheckingIn = true;
    this.render();

    try {
      const response = await performCheckIn();
      console.log('Check-in submitted:', response.txId);

      // Show pending message
      const statusEl = document.getElementById('status');
      statusEl.textContent = '⏳ Confirming transaction...';

      // Monitor transaction
      await monitorTransaction(response.txId);

      // Reload data after confirmation
      await this.loadData();
      this.render();

      // Show success
      statusEl.textContent = '✅ Check-in successful!';
      setTimeout(() => {
        statusEl.textContent = '';
      }, 3000);
    } catch (error) {
      console.error('Check-in failed:', error);
      alert(`Check-in failed: ${error.message}`);
      this.isCheckingIn = false;
      this.render();
    }
  }

  handleDisconnect() {
    disconnectWallet();
  }

  render() {
    const app = document.getElementById('app');

    if (!isConnected()) {
      app.innerHTML = `
        <div class="container">
          <h1>Daily Check-in</h1>
          <p>Connect your wallet to get started</p>
          <button onclick="app.handleConnect()" class="btn-primary">
            Connect Wallet
          </button>
        </div>
      `;
      return;
    }

    const stats = this.userStats;
    const global = this.globalStats;
    const canCheckIn = stats?.canCheckIn;

    app.innerHTML = `
      <div class="container">
        <header>
          <h1>Daily Check-in</h1>
          <p class="address">
            ${this.userAddress.substring(0, 10)}...${this.userAddress.substring(-6)}
          </p>
        </header>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Points</div>
            <div class="stat-value">${stats?.points || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Current Streak</div>
            <div class="stat-value">${stats?.streak || 0} days</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Check-ins</div>
            <div class="stat-value">${stats?.totalCheckins || 0}</div>
          </div>
        </div>

        <div class="check-in-section">
          <button 
            onclick="app.handleCheckIn()" 
            class="btn-check-in"
            ${canCheckIn && !this.isCheckingIn ? '' : 'disabled'}
          >
            ${this.isCheckingIn ? '⏳ Processing...' : (canCheckIn ? '✓ Check In' : '⏰ Already Checked In')}
          </button>
        </div>

        <div id="status" class="status-message"></div>

        <div class="global-stats">
          <h3>Global Stats</h3>
          <p>Total Check-ins: ${global?.totalCheckins || 0}</p>
          <p>Unique Users: ${global?.uniqueUsers || 0}</p>
          <p>Points Per Check-in: ${global?.pointsPerCheckin || 0}</p>
        </div>

        <button onclick="app.handleDisconnect()" class="btn-disconnect">
          Disconnect Wallet
        </button>
      </div>
    `;
  }
}

// Initialize app
const app = new CheckInApp();
app.init();
```

---

## Configuration

### Environment Variables

Create `.env.production`:
```env
VITE_API_BASE=https://stacks-api.blockstack.org
VITE_STACKS_NETWORK=mainnet
VITE_CONTRACT_ADDRESS=SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09
VITE_APP_NAME=Daily Check-in
VITE_EXPLORER_URL=https://explorer.stacks.co
VITE_FEE_AMOUNT=1000
```

---

## Project Structure

```
daily-checkin/
├── contracts/
│   └── daily-checkin.clar         # Smart contract source
├── web/
│   ├── index.html                  # Main HTML
│   ├── app.js                      # Main app component
│   ├── wallet.js                   # @stacks/connect integration
│   ├── transactions.js             # @stacks/transactions integration
│   ├── auth-config.js              # Auth configuration
│   ├── styles/
│   │   ├── metallic-theme.css
│   │   └── dark-theme.css
│   └── lib/
│       └── utils.js                # Utility functions
├── deploy-mainnet.sh               # Mainnet deployment script
├── deploy-mainnet.bat              # Windows deployment script
├── MAINNET_DEPLOYMENT.md           # Deployment guide
└── README.md                       # This file
```

---

## Deployment

### Smart Contract Deployment

#### Option 1: Hiro Sandbox (Recommended for Testing)
1. Go to https://explorer.hiro.so/sandbox/deploy?chain=mainnet
2. Copy contract from `contracts/daily-checkin.clar`
3. Paste into editor
4. Click "Deploy"
5. Approve in Hiro Wallet

#### Option 2: Using Clarinet CLI
```bash
# Verify contract
clarinet check

# Run tests
clarinet test

# Deploy to mainnet
clarinet deploy mainnet
```

### Frontend Deployment

#### Build
```bash
npm run build
```

#### Deploy to Vercel
```bash
npm install -g vercel
vercel deploy --prod
```

#### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Testing

### Unit Tests
```bash
# Run Clarity contract tests
clarinet test
```

### Integration Testing
1. Connect wallet to testnet
2. Transfer test STX
3. Perform check-ins
4. Verify points in contract

### Manual Testing
1. Start dev server: `npm run dev`
2. Connect wallet via UI
3. Click "Check In" button
4. Approve transaction in wallet
5. Verify transaction on [Stacks Explorer](https://explorer.stacks.co)

---

## API Reference

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/transactions/{txId}` | GET | Get transaction status |
| `/v2/contracts/source/{address}/{name}` | GET | Get contract source |
| `/v2/accounts/{address}` | GET | Get account balance |

### Transaction Fees

- **Contract Call Fee:** ~200-500 microSTX (network dependent)
- **Check-in Fee:** 1000 microSTX (0.001 STX)
- **Total Cost:** ~1200-1500 microSTX (~$0.30-0.40 USD)

---

## Monitoring & Debugging

### View on Explorer
- **Contract:** https://explorer.stacks.co/contract/SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09/daily-checkin
- **Deployer:** https://explorer.stacks.co/address/SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09

### Enable Debug Logging

```javascript
// Enable transaction logging
localStorage.setItem('DEBUG_TRANSACTIONS', 'true');

// View logs in browser console
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "User already checked in" | Wait 24 hours or check `can-checkin` |
| "Insufficient balance" | Add STX to wallet (need > 0.002 STX) |
| "Transaction failed" | Check network selection, increase fee |
| "Wallet not connected" | Click "Connect Wallet" button |

---

## Security Considerations

✅ **Never commit private keys** - Use `.gitignore` for sensitive files  
✅ **Use hardware wallets** - For mainnet transactions  
✅ **Verify contract address** - Always double-check before interacting  
✅ **Check explorer** - Confirm transactions before treating as complete  
✅ **Test on testnet first** - Before mainnet deployments  

---

## Support & Resources

- **Stacks Documentation:** https://docs.stacks.co
- **Hiro Documentation:** https://docs.hiro.so
- **Clarity Reference:** https://docs.stacks.co/clarity
- **Explorer:** https://explorer.stacks.co
- **Discord:** https://discord.gg/stacks

---

## Contributing

Pull requests are welcome! Please ensure:
1. Code follows project style
2. All tests pass
3. No sensitive data in commits
4. Clear commit messages

---

## License

MIT

---

## Changelog

### v2.0.0 (Current)
- ✅ Migrated to SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09 deployer
- ✅ @stacks/connect integration
- ✅ @stacks/transactions support
- ✅ Metallic theme UI
- ✅ Mainnet deployment ready
- ✅ PWA offline support

---

**Last Updated:** January 30, 2026  
**Status:** Production Ready ✅
