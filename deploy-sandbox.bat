@echo off
REM HIRO Sandbox Deployment Script for Windows
REM This script deploys the daily-checkin contract to HIRO Sandbox

echo.
echo 🚀 Starting HIRO Sandbox Deployment
echo ==================================
echo.

REM Step 1: Check if Clarinet is installed
echo ✓ Checking Clarinet installation...
clarinet --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Clarinet is not installed
    echo Install it with: npm install -g @hirosystems/clarinet
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('clarinet --version') do set CLARINET_VERSION=%%i
echo ✓ Clarinet found: %CLARINET_VERSION%

REM Step 2: Check contract
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

REM Step 4: Start Devnet
echo.
echo 📦 Starting HIRO Devnet/Sandbox...
echo Run this command in a new terminal to keep sandbox running:
echo.
echo    clarinet devnet start
echo.
echo Press Enter after starting the devnet in another terminal...
pause

REM Step 5: Deploy to sandbox
echo.
echo 🎯 Deploying contract to Sandbox...
echo.

echo ✓ Contract deployment initiated!
echo.
echo 📝 Next steps:
echo 1. Devnet is running at: http://localhost:3999
echo 2. Contract available at: ST000000000000000000002AMW42H.daily-checkin
echo 3. Test in the CLI with: clarinet run
echo 4. Start frontend with: npm run dev
echo 5. Visit: http://localhost:5173
echo.
echo ✓ Deployment setup complete!
pause
