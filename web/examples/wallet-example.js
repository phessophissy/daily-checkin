/**
 * Wallet Integration Example
 * Complete example of wallet connection and transactions
 */

async function exampleWalletConnection() {
  const walletIntegration = new StacksWalletIntegration({
    appName: 'Daily Check-in',
    appIcon: '/logo.png'
  });

  // Connect wallet
  const result = await walletIntegration.connect();
  if (result.success) {
    console.log('Connected:', result.address);
  }

  return walletIntegration;
}

async function exampleCheckIn(walletIntegration, transactionHandler) {
  try {
    // Create check-in transaction
    const txOptions = {
      contractAddress: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
      contractName: 'daily-checkin',
      functionName: 'check-in',
      functionArgs: [],
      fee: 1000, // microSTX
      network: 'testnet'
    };

    const txId = await transactionHandler.createAndBroadcast(txOptions);
    console.log('Check-in transaction:', txId);

    // Wait for confirmation
    const confirmed = await transactionHandler.waitForConfirmation(txId);
    console.log('Confirmed:', confirmed);

    return txId;
  } catch (error) {
    console.error('Check-in failed:', error);
  }
}

async function exampleGetBalance(walletService) {
  try {
    const address = walletService.getAddress();
    const balance = await walletService.getBalance(address);
    console.log('Balance (microSTX):', balance);
    console.log('Balance (STX):', balance / 1000000);
  } catch (error) {
    console.error('Failed to get balance:', error);
  }
}

async function exampleGetCheckInHistory(dataService) {
  try {
    const history = await dataService.getCheckinHistory();
    console.log('Check-in history:', history);

    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (const checkin of history) {
      const checkinDate = new Date(checkin.date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);

      if (checkinDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    console.log('Current streak:', streak);
    return history;
  } catch (error) {
    console.error('Failed to get history:', error);
  }
}

/**
 * Full app initialization example
 */
async function initializeApp() {
  // Initialize managers
  const authManager = new AuthManager();
  const themeManager = new ThemeManager();
  const offlineManager = new OfflineManager();
  const notificationService = new NotificationService();
  const accessibilityManager = new AccessibilityManager();

  // Setup theme switcher
  const { switcher, ui } = initThemeSwitcher({
    themes: ['metallic', 'dark', 'light']
  });
  document.querySelector('.header').appendChild(ui);

  // Initialize wallet
  const walletIntegration = await exampleWalletConnection();

  // Setup check-in button
  document.getElementById('checkin-btn').addEventListener('click', async () => {
    if (!walletIntegration.isConnected()) {
      await walletIntegration.connect();
    }

    const txHandler = new TransactionHandler(walletIntegration);
    const txId = await exampleCheckIn(walletIntegration, txHandler);

    if (txId) {
      notificationService.sendSuccessNotification('Check-in successful!');
    }
  });

  // Setup offline sync
  offlineManager.onChange(({ event, data }) => {
    if (event === 'offline') {
      notificationService.sendErrorNotification('You are offline. Changes will sync when online.');
    } else if (event === 'online') {
      notificationService.sendSuccessNotification('Back online. Syncing...');
    }
  });

  console.log('✅ App initialized');
  return { authManager, themeManager, walletIntegration };
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    exampleWalletConnection,
    exampleCheckIn,
    exampleGetBalance,
    exampleGetCheckInHistory,
    initializeApp
  };
}
