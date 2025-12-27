// Daily Check-in Web App
// Uses @stacks/connect for wallet connection

import { AppConfig, UserSession, showConnect, openContractCall } from '@stacks/connect';
import { 
  callReadOnlyFunction, 
  cvToJSON, 
  principalCV,
  PostConditionMode 
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';

// Contract Configuration
const CONTRACT_ADDRESS = 'SP31G2FZ5JN87BATZMP4ZRYE5F7WZQDNEXJ7G7X97';
const CONTRACT_NAME = 'daily-checkin';
const NETWORK = STACKS_MAINNET;

// App Config
const appConfig = new AppConfig(['store_write']);
const userSession = new UserSession({ appConfig });

// DOM Elements
const connectSection = document.getElementById('connect-section');
const userSection = document.getElementById('user-section');
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const checkinBtn = document.getElementById('checkin-btn');
const userAddressEl = document.getElementById('user-address');
const userPointsEl = document.getElementById('user-points');
const userStreakEl = document.getElementById('user-streak');
const userCheckinsEl = document.getElementById('user-checkins');
const checkinStatusEl = document.getElementById('checkin-status');
const globalCheckinsEl = document.getElementById('global-checkins');
const globalUsersEl = document.getElementById('global-users');
const pointsPerCheckinEl = document.getElementById('points-per-checkin');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (userSession.isUserSignedIn()) {
    showUserSection();
    loadUserStats();
  }
  loadGlobalStats();
});

// Connect wallet
connectBtn.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'Daily Check-in',
      icon: 'https://stacks.co/icon.png',
    },
    redirectTo: '/',
    onFinish: () => {
      showUserSection();
      loadUserStats();
    },
    userSession,
  });
});

// Disconnect
disconnectBtn.addEventListener('click', () => {
  userSession.signUserOut('/');
  showConnectSection();
});

// Check-in
checkinBtn.addEventListener('click', async () => {
  checkinBtn.disabled = true;
  checkinStatusEl.textContent = 'Processing...';
  checkinStatusEl.className = 'status-text';

  try {
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'check-in',
      functionArgs: [],
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        checkinStatusEl.textContent = `✅ Check-in submitted! TX: ${data.txId.slice(0, 16)}...`;
        checkinStatusEl.className = 'status-text success';
        setTimeout(() => loadUserStats(), 5000);
      },
      onCancel: () => {
        checkinStatusEl.textContent = 'Check-in cancelled';
        checkinStatusEl.className = 'status-text';
        checkinBtn.disabled = false;
      },
    });
  } catch (error) {
    checkinStatusEl.textContent = `Error: ${error.message}`;
    checkinStatusEl.className = 'status-text error';
    checkinBtn.disabled = false;
  }
});

function showConnectSection() {
  connectSection.classList.remove('hidden');
  userSection.classList.add('hidden');
}

function showUserSection() {
  connectSection.classList.add('hidden');
  userSection.classList.remove('hidden');
  
  const userData = userSession.loadUserData();
  const address = userData.profile.stxAddress.mainnet;
  userAddressEl.textContent = `${address.slice(0, 8)}...${address.slice(-6)}`;
}

async function loadUserStats() {
  const userData = userSession.loadUserData();
  const address = userData.profile.stxAddress.mainnet;

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-stats',
      functionArgs: [principalCV(address)],
      network: NETWORK,
      senderAddress: address,
    });

    const stats = cvToJSON(result).value;
    userPointsEl.textContent = stats.points.value;
    userStreakEl.textContent = stats.streak.value;
    userCheckinsEl.textContent = stats['total-checkins'].value;

    const canCheckin = stats['can-checkin'].value;
    checkinBtn.disabled = !canCheckin;
    
    if (!canCheckin) {
      checkinStatusEl.textContent = 'Already checked in today. Come back tomorrow!';
    } else {
      checkinStatusEl.textContent = 'Ready to check in!';
    }
  } catch (error) {
    console.error('Error loading user stats:', error);
  }
}

async function loadGlobalStats() {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-global-stats',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const stats = cvToJSON(result).value;
    globalCheckinsEl.textContent = stats['total-checkins'].value;
    globalUsersEl.textContent = stats['unique-users'].value;
    pointsPerCheckinEl.textContent = stats['points-per-checkin'].value;
  } catch (error) {
    console.error('Error loading global stats:', error);
  }
}
