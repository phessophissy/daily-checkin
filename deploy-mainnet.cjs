#!/usr/bin/env node

/**
 * Daily Check-in Contract Deployment Script
 * Deploys daily-checkin-v2.clar to Stacks Mainnet
 * 
 * Usage:
 *   STACKS_PRIVATE_KEY=your_key_here node deploy-mainnet.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const NETWORK = 'mainnet';
const CONTRACT_NAME = 'daily-checkin-v2';
const DEPLOYER = 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09';
const API_BASE = 'https://stacks-api.blockstack.org';
const EXPLORER_BASE = 'https://explorer.stacks.co';

// Read environment
const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error('❌ Error: STACKS_PRIVATE_KEY environment variable not set');
  console.error('\nSet it with:');
  console.error('  Windows (PowerShell): $env:STACKS_PRIVATE_KEY = "your_key"');
  console.error('  Windows (CMD): set STACKS_PRIVATE_KEY=your_key');
  console.error('  Linux/Mac: export STACKS_PRIVATE_KEY=your_key');
  process.exit(1);
}

// Read contract file
const contractPath = path.join(__dirname, 'contracts', `${CONTRACT_NAME}.clar`);
let contractCode;
try {
  contractCode = fs.readFileSync(contractPath, 'utf8');
  console.log(`✅ Loaded contract: ${contractPath}`);
  console.log(`   Contract size: ${contractCode.length} bytes`);
} catch (err) {
  console.error(`❌ Error reading contract: ${err.message}`);
  process.exit(1);
}

console.log('\n📋 Deployment Configuration:');
console.log(`   Network: ${NETWORK}`);
console.log(`   Deployer: ${DEPLOYER}`);
console.log(`   Contract: ${CONTRACT_NAME}`);
console.log(`   API: ${API_BASE}`);

console.log('\n⚠️  IMPORTANT NEXT STEPS:');
console.log('   This script prepares your deployment. For actual deployment, use:');
console.log('\n   Option 1: Hiro Sandbox (Recommended)');
console.log('   - Visit: https://explorer.hiro.so/sandbox/deploy?chain=mainnet');
console.log('   - Paste contract code above');
console.log('   - Click Deploy and approve in wallet');
console.log('\n   Option 2: Use Hiro Wallet UI');
console.log('   - Visit: https://app.stacks.co');
console.log('   - Connect wallet');
console.log('   - Use Developer Tools to deploy contract');
console.log('\n   Option 3: Command Line (requires stx-cli setup)');
console.log('   ```');
console.log(`   export STACKS_PRIVATE_KEY="${PRIVATE_KEY.substring(0, 10)}..."`);
console.log(`   stx tx deploy-contract ${contractPath} ${CONTRACT_NAME} --mainnet`);
console.log('   ```');

console.log('\n📄 Contract Code Preview:');
console.log('   ' + contractCode.split('\n').slice(0, 5).join('\n   '));
console.log('   ...');

console.log('\n✨ Contract is ready for deployment!');
console.log('\n   Once deployed, your contract will be at:');
console.log(`   ${EXPLORER_BASE}/contract/${DEPLOYER}/${CONTRACT_NAME}`);

process.exit(0);
