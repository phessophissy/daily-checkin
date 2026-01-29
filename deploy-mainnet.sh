#!/bin/bash
# HIRO Mainnet Deployment Script
# ⚠️ WARNING: This deploys to MAINNET with REAL STX
# Deploy the daily-checkin contract to Stacks Mainnet

echo "⚠️  MAINNET DEPLOYMENT - THIS USES REAL STX"
echo "==========================================="
echo ""
read -p "Are you sure you want to deploy to MAINNET? Type 'YES' to confirm: " confirm
if [ "$confirm" != "YES" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting HIRO Mainnet Deployment"
echo "===================================="

# Step 1: Check environment variables
echo "✓ Checking environment configuration..."
if [ -z "$STACKS_PRIVATE_KEY" ]; then
    echo "❌ STACKS_PRIVATE_KEY not set"
    echo "Set it with: export STACKS_PRIVATE_KEY='your_private_key'"
    exit 1
fi

if [ -z "$STACKS_NETWORK" ]; then
    export STACKS_NETWORK="mainnet"
    echo "✓ Using MAINNET"
fi

# Step 2: Verify contract
echo ""
echo "✓ Checking contract syntax..."
clarinet check

if [ $? -ne 0 ]; then
    echo "❌ Contract syntax errors"
    exit 1
fi

# Step 3: Run tests
echo ""
echo "🧪 Running contract tests..."
clarinet test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

echo "✓ All tests passed"

# Step 4: Show deployment info
echo ""
echo "📝 Deployment Configuration:"
echo "   Network: MAINNET"
echo "   Deployer: SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09"
echo "   Contract: daily-checkin"
echo "   Fee: 0.001 STX per check-in"
echo "   API Endpoint: https://stacks-api.blockstack.org"
echo ""

# Step 5: Deploy
echo "🎯 Deploying to Mainnet..."
echo "This will take a few minutes..."
echo ""

# Generate and broadcast transaction
# Using stx-cli or similar tool
clarinet deploy mainnet

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Deployment Details:"
    echo "   Network: https://explorer.stacks.co"
    echo "   Contract: SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.daily-checkin"
    echo "   Status: Check explorer for confirmation"
    echo ""
else
    echo ""
    echo "❌ Deployment failed"
    echo "Check your private key and network connection"
    exit 1
fi
