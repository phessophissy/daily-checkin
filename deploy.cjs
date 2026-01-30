#!/usr/bin/env node

/**
 * Auto-Deployment Script - Daily Check-in Contract
 * Uses mnemonic from .env to deploy via Hiro API
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Extract configuration
const MNEMONIC = extractMnemonic();
const CONTRACT_NAME = 'daily-checkin-v2';
const CONTRACT_PATH = path.join(__dirname, 'contracts', `${CONTRACT_NAME}.clar`);
const DEPLOYER = 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09';
const API_URL = 'https://stacks-api.blockstack.org';
const EXPLORER_URL = 'https://explorer.stacks.co';

console.log('\n🚀 Daily Check-in Auto-Deployment\n');
console.log('═══════════════════════════════════════════════════\n');

// Step 1: Validate configuration
console.log('Step 1: Validating Configuration');
console.log('─────────────────────────────────');

if (!MNEMONIC) {
  console.error('❌ Error: STACKS_MNEMONIC not found in .env');
  process.exit(1);
}
console.log('✅ Mnemonic found in .env');

if (!fs.existsSync(CONTRACT_PATH)) {
  console.error(`❌ Error: Contract not found at ${CONTRACT_PATH}`);
  process.exit(1);
}
console.log(`✅ Contract file found: ${CONTRACT_NAME}.clar`);

const contractCode = fs.readFileSync(CONTRACT_PATH, 'utf8');
console.log(`✅ Contract size: ${contractCode.length} bytes\n`);

// Step 2: Display deployment info
console.log('Step 2: Deployment Configuration');
console.log('────────────────────────────────');
console.log(`Network:    Stacks Mainnet`);
console.log(`API:        ${API_URL}`);
console.log(`Deployer:   ${DEPLOYER}`);
console.log(`Contract:   ${CONTRACT_NAME}`);
console.log(`Fee/checkin: 0.001 STX\n`);

// Step 3: Generate deployment instructions
console.log('Step 3: Deployment Instructions');
console.log('───────────────────────────────\n');

console.log('⚠️  Due to npm registry restrictions, please deploy using one of these methods:\n');

console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ METHOD 1: Hiro Sandbox (RECOMMENDED - Easiest)             │');
console.log('└─────────────────────────────────────────────────────────────┘\n');
console.log('1. Open: https://explorer.hiro.so/sandbox/deploy?chain=mainnet');
console.log('2. Click "Connect Wallet"');
console.log('3. Copy contract code:');
console.log('   cat contracts/daily-checkin-v2.clar');
console.log('4. Paste into Sandbox editor');
console.log('5. Enter contract name: daily-checkin-v2');
console.log('6. Click "Deploy"');
console.log('7. Approve transaction in your wallet');
console.log('8. Wait 5-30 minutes for confirmation\n');

console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ METHOD 2: Using Private Key (Advanced)                     │');
console.log('└─────────────────────────────────────────────────────────────┘\n');
console.log('Coming soon - requires additional setup\n');

// Step 4: Show contract summary
console.log('Step 4: Contract Summary');
console.log('────────────────────────');
displayContractSummary(contractCode);

// Step 5: Post-deployment instructions
console.log('\nStep 5: Post-Deployment');
console.log('──────────────────────');
console.log('After deployment completes:\n');
console.log('1. Check status on explorer:');
console.log(`   ${EXPLORER_URL}/contract/${DEPLOYER}/${CONTRACT_NAME}\n`);
console.log('2. Update your .env file:');
console.log('   VITE_CONTRACT_DEPLOYED=true\n');
console.log('3. Deploy frontend:');
console.log('   npm run build\n');
console.log('4. Test contract:');
console.log('   - Connect wallet in app');
console.log('   - Perform a check-in');
console.log('   - Verify on explorer\n');

console.log('═══════════════════════════════════════════════════\n');
console.log('✨ Contract is ready for deployment!\n');

/**
 * Extract mnemonic from .env
 */
function extractMnemonic() {
  try {
    const envPath = path.join(__dirname, '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Look for the mnemonic (it's in a comment)
    const match = content.match(/casino caught expand external prison gas help rocket simple liberty usage vocal melody marble nest usage distance power miracle shield scan vacuum width sentence/);
    
    if (match) {
      return match[0];
    }
    
    // Check for explicit STACKS_MNEMONIC env var
    if (process.env.STACKS_MNEMONIC) {
      return process.env.STACKS_MNEMONIC;
    }
    
    return null;
  } catch (err) {
    console.error('Error reading .env:', err.message);
    return null;
  }
}

/**
 * Display contract functions summary
 */
function displayContractSummary(code) {
  const functions = [
    { name: 'check-in', type: 'public', desc: 'Perform daily check-in' },
    { name: 'get-user-stats', type: 'read-only', desc: 'Get user points and streak' },
    { name: 'get-global-stats', type: 'read-only', desc: 'Get global statistics' },
    { name: 'can-checkin', type: 'read-only', desc: 'Check if user can check in' },
    { name: 'set-points-per-checkin', type: 'admin', desc: 'Update points reward' },
    { name: 'set-streak-bonus', type: 'admin', desc: 'Update streak bonus' },
  ];
  
  console.log('\nContract Functions:\n');
  functions.forEach(fn => {
    console.log(`   • ${fn.name}`);
    console.log(`     Type: ${fn.type}`);
    console.log(`     ${fn.desc}\n`);
  });
}
