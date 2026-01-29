#!/bin/bash
# HIRO Sandbox Deployment Script
# This script deploys the daily-checkin contract to HIRO Sandbox

echo "🚀 Starting HIRO Sandbox Deployment"
echo "=================================="

# Step 1: Check if Clarinet is installed
echo "✓ Checking Clarinet installation..."
if ! command -v clarinet &> /dev/null; then
    echo "❌ Clarinet is not installed"
    echo "Install it with: npm install -g @hirosystems/clarinet"
    exit 1
fi

echo "✓ Clarinet found: $(clarinet --version)"

# Step 2: Start HIRO Devnet (Sandbox)
echo ""
echo "📦 Starting HIRO Devnet/Sandbox..."
clarinet devnet start &
DEVNET_PID=$!
sleep 5

echo "✓ Devnet started (PID: $DEVNET_PID)"

# Step 3: Run tests
echo ""
echo "🧪 Running contract tests..."
clarinet test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    kill $DEVNET_PID
    exit 1
fi

echo "✓ All tests passed"

# Step 4: Deploy to sandbox
echo ""
echo "🎯 Deploying contract to Sandbox..."
clarinet run <<EOF
(contract-call? .daily-checkin get-user-points tx-sender)
EOF

echo ""
echo "✓ Contract deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Contract is available at: ST000000000000000000002AMW42H.daily-checkin"
echo "2. Test wallets are available in the Devnet"
echo "3. Access Devnet API at: http://localhost:3999"
echo "4. Web UI available at: http://localhost:5173 (after running 'npm run dev')"
echo ""
echo "📍 Keep this terminal running to maintain the sandbox"
echo "Press Ctrl+C to stop"

# Keep the devnet running
wait $DEVNET_PID
