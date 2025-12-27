#!/usr/bin/env node
// Transfer STX from main wallet to multiple wallets
// Usage: node transfer-stx.js <amount-per-wallet>

import pkg from '@stacks/transactions';
const { makeSTXTokenTransfer, broadcastTransaction, AnchorMode, getAddressFromPrivateKey } = pkg;

import networkPkg from '@stacks/network';
const { StacksMainnet, StacksTestnet } = networkPkg;

import walletPkg from '@stacks/wallet-sdk';
const { generateWallet } = walletPkg;

import { readFileSync } from 'fs';

// Configuration
const CONFIG = {
  NETWORK: process.env.NETWORK || 'mainnet',
  MNEMONIC: process.env.MNEMONIC || '',
  WALLETS_FILE: './wallets.json',
  FEE: 2000 // 0.002 STX fee
};

function getNetwork() {
  return CONFIG.NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
}

function getApiUrl() {
  return CONFIG.NETWORK === 'mainnet'
    ? 'https://api.mainnet.hiro.so'
    : 'https://api.testnet.hiro.so';
}

// Derive private key from mnemonic
async function getPrivateKeyFromMnemonic(mnemonic) {
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: ''
  });
  return wallet.accounts[0].stxPrivateKey;
}

// Load destination wallets
function loadWallets() {
  const data = JSON.parse(readFileSync(CONFIG.WALLETS_FILE, 'utf8'));
  return data.wallets;
}

// Get account nonce
async function getAccountNonce(address) {
  const response = await fetch(`${getApiUrl()}/extended/v1/address/${address}/nonces`);
  const data = await response.json();
  return data.possible_next_nonce;
}

// Get STX balance
async function getBalance(address) {
  const response = await fetch(`${getApiUrl()}/extended/v1/address/${address}/stx`);
  const data = await response.json();
  return parseInt(data.balance);
}

// Transfer STX to one address
async function transferSTX(senderKey, recipient, amountMicroSTX, nonce) {
  const txOptions = {
    recipient: recipient,
    amount: amountMicroSTX,
    senderKey: senderKey,
    network: getNetwork(),
    anchorMode: AnchorMode.Any,
    fee: CONFIG.FEE,
    nonce: nonce
  };

  const transaction = await makeSTXTokenTransfer(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, getNetwork());
  
  return broadcastResponse;
}

async function main() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║       STX Distribution Tool           ║');
  console.log('╚═══════════════════════════════════════╝\n');

  // Check for mnemonic
  if (!CONFIG.MNEMONIC) {
    console.log('❌ Error: MNEMONIC environment variable not set');
    console.log('\nUsage:');
    console.log('  MNEMONIC="your 24 word seed phrase" node transfer-stx.js <amount-per-wallet>');
    console.log('\nExample (send 0.02 STX to each wallet):');
    console.log('  MNEMONIC="word1 word2 ... word24" node transfer-stx.js 0.02');
    process.exit(1);
  }

  // Get amount from args
  const amountSTX = parseFloat(process.argv[2]);
  if (!amountSTX || amountSTX <= 0) {
    console.log('❌ Error: Please specify amount per wallet');
    console.log('\nUsage: MNEMONIC="..." node transfer-stx.js <amount>');
    console.log('Example: MNEMONIC="..." node transfer-stx.js 0.02');
    process.exit(1);
  }

  const amountMicroSTX = Math.floor(amountSTX * 1000000);
  
  // Load wallets
  const wallets = loadWallets();
  console.log(`📋 Loaded ${wallets.length} destination wallets`);
  
  // Get sender private key from mnemonic
  console.log('🔐 Deriving wallet from mnemonic...');
  const senderKey = await getPrivateKeyFromMnemonic(CONFIG.MNEMONIC);
  const senderAddress = getAddressFromPrivateKey(senderKey);
  const senderBalance = await getBalance(senderAddress);
  const senderBalanceSTX = senderBalance / 1000000;
  
  console.log(`\n💳 Sender: ${senderAddress.slice(0, 10)}...${senderAddress.slice(-8)}`);
  console.log(`💰 Balance: ${senderBalanceSTX.toFixed(6)} STX`);
  
  // Calculate total needed
  const totalNeeded = (amountMicroSTX + CONFIG.FEE) * wallets.length;
  const totalNeededSTX = totalNeeded / 1000000;
  
  console.log(`\n📊 Transfer Details:`);
  console.log(`   Amount per wallet: ${amountSTX} STX`);
  console.log(`   Fee per transfer: ${CONFIG.FEE / 1000000} STX`);
  console.log(`   Number of wallets: ${wallets.length}`);
  console.log(`   Total needed: ${totalNeededSTX.toFixed(6)} STX`);
  
  if (senderBalance < totalNeeded) {
    console.log(`\n❌ Insufficient balance!`);
    console.log(`   Need: ${totalNeededSTX.toFixed(6)} STX`);
    console.log(`   Have: ${senderBalanceSTX.toFixed(6)} STX`);
    process.exit(1);
  }

  console.log(`\n✅ Sufficient balance. Starting transfers...\n`);

  // Get starting nonce
  let nonce = await getAccountNonce(senderAddress);
  let successCount = 0;
  let failCount = 0;

  for (const wallet of wallets) {
    try {
      const result = await transferSTX(
        senderKey,
        wallet.address,
        amountMicroSTX,
        nonce
      );

      if (result.txid) {
        console.log(`✅ Wallet ${wallet.index}: ${wallet.address.slice(0, 10)}... - txid: ${result.txid.slice(0, 16)}...`);
        successCount++;
        nonce++;
      } else {
        console.log(`❌ Wallet ${wallet.index}: ${wallet.address.slice(0, 10)}... - ${result.error || 'Failed'}`);
        failCount++;
      }

      // Small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.log(`❌ Wallet ${wallet.index}: ${wallet.address.slice(0, 10)}... - ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`========================================\n`);
}

main().catch(console.error);
