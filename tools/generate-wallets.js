#!/usr/bin/env node
// Generate 20 new Stacks wallets
// Saves to wallets.json

import { randomBytes } from 'crypto';
import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';
import { writeFileSync, existsSync } from 'fs';

const WALLET_COUNT = 20;
const OUTPUT_FILE = './wallets.json';

function generatePrivateKey() {
  return randomBytes(32).toString('hex');
}

function generateWallets() {
  console.log(`\n🔐 Generating ${WALLET_COUNT} Stacks wallets...\n`);
  
  if (existsSync(OUTPUT_FILE)) {
    console.log('⚠️  wallets.json already exists!');
    console.log('   Delete it first if you want to generate new wallets.');
    process.exit(1);
  }

  const wallets = [];
  
  for (let i = 0; i < WALLET_COUNT; i++) {
    const privateKey = generatePrivateKey();
    const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);
    
    wallets.push({
      index: i + 1,
      address: address,
      privateKey: privateKey
    });
    
    console.log(`✅ Wallet ${i + 1}: ${address}`);
  }

  const output = {
    generated: new Date().toISOString(),
    network: 'mainnet',
    count: WALLET_COUNT,
    wallets: wallets
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Saved ${WALLET_COUNT} wallets to ${OUTPUT_FILE}`);
  console.log('\n⚠️  IMPORTANT: Back up wallets.json securely!');
}

generateWallets();
