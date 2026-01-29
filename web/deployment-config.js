/**
 * Build and Deployment Configuration
 * Vite configuration for Daily Checkin Frontend
 */

// vite.config.js
const config = {
  // Project root directory
  root: './',
  
  // Base public path
  base: '/',

  // Build output directory
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            '@stacks/connect',
            '@stacks/transactions',
            '@stacks/network',
          ],
          'ui': [
            'web/components.js',
            'web/config.js',
          ],
        },
      },
    },
  },

  // Development server
  server: {
    port: 5173,
    open: true,
    cors: true,
    middleware: [],
  },

  // Environment variables
  env: {
    STACKS_NETWORK: 'testnet',
    STACKS_API_URL: 'https://stacks-testnet-api.herokuapp.com',
    CONTRACT_DEPLOYER: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
    CONTRACT_NAME: 'daily-checkin',
    CHECKIN_FEE: '0.001',
  },

  // Plugins
  plugins: [],

  // Resolve configuration
  resolve: {
    alias: {
      '@': '/web',
      '@config': '/web/config.js',
      '@api': '/web/api.js',
      '@utils': '/web/utils.js',
    },
  },

  // CSS preprocessing
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          $gold: #d4af37;
          $silver: #c0c0c0;
          $darkBg: #0d0d0d;
        `,
      },
    },
  },

  // Optimization
  optimizeDeps: {
    include: ['@stacks/connect', '@stacks/transactions'],
  },
};

// Deployment configuration by environment
const deploymentConfigs = {
  development: {
    network: 'testnet',
    apiUrl: 'https://stacks-testnet-api.herokuapp.com',
    debug: true,
  },
  staging: {
    network: 'testnet',
    apiUrl: 'https://stacks-testnet-api.herokuapp.com',
    debug: false,
  },
  production: {
    network: 'mainnet',
    apiUrl: 'https://stacks-api.blockstack.org',
    debug: false,
  },
};

// Clarinet.toml - Stacks project configuration
const clarinetConfig = `[project]
name = "daily-checkin"
authors = ["Daily Checkin Team"]
license = "MIT"
description = "Daily Check-in System on Stacks Blockchain"

[project.cache_dir]
path = ".clarinet"

[contracts.daily-checkin]
path = "contracts/daily-checkin.clar"
depends_on = []

[project.cache_dir]
path = ".clarinet"

[deployments.default]
network = "testnet"
bitcoin_network = "testnet"
plan = [
  { contract = "daily-checkin" }
]

[test_settings]
enable_logs = true
`;

// Package.json scripts
const packageJsonScripts = {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "serve": "vite serve",
  "test": "vitest",
  "lint": "eslint . --ext .js,.html",
  "format": "prettier --write .",
  "deploy": "npm run build && npm run deploy:contract",
  "deploy:contract": "clarinet deployments apply",
  "clarinet:devnet": "clarinet devnet start",
  "clarinet:test": "clarinet test",
  "clean": "rm -rf dist node_modules",
};

// Environment configuration template
const envTemplate = `# Stacks Network
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://stacks-testnet-api.herokuapp.com

# Contract Configuration
VITE_CONTRACT_DEPLOYER=SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09
VITE_CONTRACT_NAME=daily-checkin
VITE_CHECKIN_FEE=0.001

# Application Settings
VITE_APP_NAME=Daily Checkin
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_HISTORY=true
VITE_ENABLE_STREAKS=true
`;

// Docker configuration for deployment
const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "preview"]
`;

const dockerignore = `node_modules
dist
.git
.gitignore
.env
.env.local
.DS_Store
*.log
`;

// GitHub Actions workflow for CI/CD
const githubActionsWorkflow = `name: Deploy Daily Checkin

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Test
        run: npm run test
      
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: npm run deploy
`;

// Deployment script
const deploymentScript = `#!/bin/bash

# Daily Checkin Deployment Script

set -e

echo "🚀 Starting Daily Checkin Deployment..."

# Check environment
if [ -z "$DEPLOYMENT_ENV" ]; then
  echo "❌ DEPLOYMENT_ENV not set"
  exit 1
fi

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building application..."
npm run build

echo "✅ Build successful!"

# Deploy based on environment
case "$DEPLOYMENT_ENV" in
  development)
    echo "🌐 Deploying to development..."
    npm run dev
    ;;
  staging)
    echo "🌐 Deploying to staging..."
    npm run preview
    ;;
  production)
    echo "🌐 Deploying to production..."
    npm run deploy:contract
    echo "📢 Production deployment complete!"
    ;;
  *)
    echo "❌ Unknown deployment environment: $DEPLOYMENT_ENV"
    exit 1
    ;;
esac

echo "✨ Deployment finished!"
`;

// Deployment instructions
const deploymentInstructions = `# Daily Checkin Deployment Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- Stacks wallet (Hiro or Xverse)
- Clarinet (for smart contract testing)

## Local Development

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open browser and navigate to \`http://localhost:5173\`

## Smart Contract Development

1. Start Clarinet devnet:
   \`\`\`bash
   npm run clarinet:devnet
   \`\`\`

2. In another terminal, test contracts:
   \`\`\`bash
   npm run clarinet:test
   \`\`\`

## Building for Production

1. Build application:
   \`\`\`bash
   npm run build
   \`\`\`

2. Preview production build:
   \`\`\`bash
   npm run preview
   \`\`\`

3. Deploy smart contract:
   \`\`\`bash
   npm run deploy:contract
   \`\`\`

## Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Contract deployed to testnet
- [ ] Frontend build successful
- [ ] Security audit completed
- [ ] Performance metrics reviewed
- [ ] Analytics configured
- [ ] Backup and recovery plan ready

## Troubleshooting

### Build errors
- Clear node_modules: \`npm run clean\`
- Reinstall: \`npm install\`

### Contract deployment fails
- Check Stacks wallet connection
- Verify contract syntax: \`npm run clarinet:test\`
- Review deployment logs

### Connection issues
- Verify API URL in .env
- Check network connectivity
- Test with testnet faucet

## Support

For issues and questions:
- GitHub Issues: [link]
- Discord: [link]
- Email: support@dailycheckin.dev
`;

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    config,
    deploymentConfigs,
    clarinetConfig,
    packageJsonScripts,
    envTemplate,
    dockerfile,
    dockerignore,
    githubActionsWorkflow,
    deploymentScript,
    deploymentInstructions,
  };
}
