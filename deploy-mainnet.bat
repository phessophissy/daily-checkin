@echo off
REM HIRO Mainnet Deployment Script for Windows
REM ⚠️ WARNING: This deploys to MAINNET with REAL STX

echo.
echo ⚠️  MAINNET DEPLOYMENT - THIS USES REAL STX
echo ===========================================
echo.

set /p confirm="Are you sure you want to deploy to MAINNET? Type 'YES' to confirm: "
if /i not "%confirm%"=="YES" (
    echo ❌ Deployment cancelled
    pause
    exit /b 1
)

echo.
echo 🚀 Starting HIRO Mainnet Deployment
echo ====================================
echo.

REM Step 1: Check environment variables
echo ✓ Checking environment configuration...
if not defined STACKS_PRIVATE_KEY (
    echo ❌ STACKS_PRIVATE_KEY not set
    echo Set it with: set STACKS_PRIVATE_KEY=your_private_key
    pause
    exit /b 1
)

if not defined STACKS_NETWORK (
    set STACKS_NETWORK=mainnet
    echo ✓ Using MAINNET
)

REM Step 2: Verify contract
echo.
echo ✓ Checking contract syntax...
clarinet check
if errorlevel 1 (
    echo ❌ Contract syntax errors
    pause
    exit /b 1
)

REM Step 3: Run tests
echo.
echo 🧪 Running contract tests...
clarinet test
if errorlevel 1 (
    echo ❌ Tests failed
    pause
    exit /b 1
)

echo ✓ All tests passed

REM Step 4: Show deployment info
echo.
echo 📝 Deployment Configuration:
echo    Network: MAINNET
echo    Deployer: SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09
echo    Contract: daily-checkin
echo    Fee: 0.001 STX per check-in
echo    API Endpoint: https://stacks-api.blockstack.org
echo.

REM Step 5: Deploy
echo 🎯 Deploying to Mainnet...
echo This will take a few minutes...
echo.

clarinet deploy mainnet

if errorlevel 1 (
    echo.
    echo ❌ Deployment failed
    echo Check your private key and network connection
    pause
    exit /b 1
)

echo.
echo ✅ Deployment successful!
echo.
echo 📊 Deployment Details:
echo    Network: https://explorer.stacks.co
echo    Contract: SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.daily-checkin
echo    Status: Check explorer for confirmation
echo.
pause
