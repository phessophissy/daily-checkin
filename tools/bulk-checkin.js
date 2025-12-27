#!/usr/bin/env node
// Bulk check-in tool for daily-checkin contract
// Usage: node bulk-checkin.js [status|checkin]

import pkg from '@stacks/transactions';
const { 
  makeContractCall, 
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  getAddressFromPrivateKey,
  callReadOnlyFunction,
  cvToJSON,
  principalCV
} = pkg;

import networkPkg from '@stacks/network';
const { StacksMainnet, StacksTestnet } = networkPkg;

import { readFileSync } from 'fs';

// Configuration
const CONFIG = {
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || 'SP31G2FZ5JN87BATZMP4ZRYE5F7WZQDNEXJ7G7X97',
  CONTRACT_NAME: 'daily-checkin',
  NETWORK: process.env.NETWORK || 'mainnet',
  WALLETS_FILE: './wallets.json',
  FEE: 2000
};

function getNetwork() {
  return CONFIG.NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
}

function getApiUrl() {
  return CONFIG.NETWORK === 'mainnet'
    ? 'https://api.mainnet.hiro.so'
    : 'https://api.testnet.hiro.so';
}

function loadWallets() {
  const data = JSON.parse(readFileSync(CONFIG.WALLETS_FILE, 'utf8'));
  return data.wallets;
}

async function getAccountNonce(address) {
  const response = await fetch(`${getApiUrl()}/extended/v1/address/${address}/nonces`);
  const data = await response.json();
  return data.possible_next_nonce;
}

async function getBalance(address) {
  const response = await fetch(`${getApiUrl()}/extended/v1/address/${address}/stx`);
  const data = await response.json();
  return parseInt(data.balance) / 1000000;
}

async function getUserStats(address) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONFIG.CONTRACT_ADDRESS,
      contractName: CONFIG.CONTRACT_NAME,
      functionName: 'get-user-stats',
      functionArgs: [principalCV(address)],
      network: getNetwork(),
      senderAddress: address
    });
    return cvToJSON(result);
  } catch (error) {
    return null;
  }
}

async function checkIn(privateKey, nonce) {
  const txOptions = {
    contractAddress: CONFIG.CONTRACT_ADDRESS,
    contractName: CONFIG.CONTRACT_NAME,
    functionName: 'check-in',
    functionArgs: [],
    senderKey: privateKey,
    network: getNetwork(),
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: CONFIG.FEE,
    nonce: nonce
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, getNetwork());
  return broadcastResponse;
}

async function showStatus() {
  console.log('\n=== Wallet Status ===\n');
  
  const wallets = loadWallets();
  
  for (const wallet of wallets) {
    const balance = await getBalance(wallet.address);
    const stats = await getUserStats(wallet.address);
    
    const points = stats?.value?.points?.value || '0';
    const streak = stats?.value?.streak?.value || '0';
    const canCheckin = stats?.value?.['can-checkin']?.value || false;
    
    const statusIcon = canCheckin ? '🟢' : '🔴';
    console.log(`${statusIcon} Wallet ${wallet.index}: ${wallet.address.slice(0, 12)}... | ${balance.toFixed(4)} STX | Points: ${points} | Streak: ${streak}`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function runBulkCheckin() {
  console.log('\n=== Running Bulk Check-in ===\n');
  
  const wallets = loadWallets();
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const wallet of wallets) {
    const address = getAddressFromPrivateKey(wallet.privateKey);
    
    // Check if can check in
    const stats = await getUserStats(address);
    const canCheckin = stats?.value?.['can-checkin']?.value;
    
    if (!canCheckin && stats !== null) {
      console.log(`⏭️  Wallet ${wallet.index}: Already checked in today`);
      skipCount++;
      continue;
    }

    try {
      const nonce = await getAccountNonce(address);
      const result = await checkIn(wallet.privateKey, nonce);

      if (result.txid) {
        console.log(`✅ Wallet ${wallet.index}: ${address.slice(0, 12)}... - txid: ${result.txid.slice(0, 16)}...`);
        successCount++;
      } else {
        console.log(`❌ Wallet ${wallet.index}: ${result.error || 'Failed'}`);
        failCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.log(`❌ Wallet ${wallet.index}: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`✅ Checked in: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`========================================\n`);
}

async function main() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║       Daily Check-in Tool             ║');
  console.log('╚═══════════════════════════════════════╝');

  if (CONFIG.CONTRACT_ADDRESS === 'SP_YOUR_ADDRESS_HERE') {
    console.log('\n⚠️  Please set CONTRACT_ADDRESS in config or use:');
    console.log('   CONTRACT_ADDRESS=SPxxx... node bulk-checkin.js [command]');
  }

  const command = process.argv[2] || 'status';

  switch (command) {
    case 'status':
      await showStatus();
      break;
    case 'checkin':
      await runBulkCheckin();
      break;
    default:
      console.log('\nUsage: node bulk-checkin.js [command]');
      console.log('\nCommands:');
      console.log('  status   - Show wallet status and points');
      console.log('  checkin  - Run check-in for all wallets');
  }
}

main().catch(console.error);
