# Daily Check-in Points System

A Stacks blockchain-based daily check-in system where users earn points for consistent participation. Built with Clarity smart contracts.

## 🎯 Overview

Users can check in once per day (every 144 blocks ~24hrs) and earn points. Consecutive check-ins build streaks that multiply rewards!

**Deployed Contract:** [`SP31G2FZ5JN87BATZMP4ZRYE5F7WZQDNEXJ7G7X97.daily-checkin`](https://explorer.hiro.so/txid/SP31G2FZ5JN87BATZMP4ZRYE5F7WZQDNEXJ7G7X97.daily-checkin?chain=mainnet)

## ✨ Features

- **Daily Check-ins**: Check in once every 144 blocks (~24 hours)
- **Points System**: Earn 100 base points per check-in
- **Streak Bonuses**: Get +10 bonus points per consecutive day (up to 70 bonus)
- **Leaderboard Ready**: Track total points and current streaks
- **Low Fee**: Only 0.001 STX per check-in

## 📊 Points Calculation

| Streak Days | Base Points | Bonus | Total |
|-------------|-------------|-------|-------|
| 1           | 100         | 0     | 100   |
| 2           | 100         | 10    | 110   |
| 3           | 100         | 20    | 120   |
| 7+          | 100         | 70    | 170   |

## 🚀 Quick Start

### Using the Web Interface

```bash
cd web
npm install
npm run dev
```

Connect your Stacks wallet and click "Check In" to participate!

### Using CLI Tools

```bash
cd tools
npm install

# Generate wallets for bulk operations
node generate-wallets.js

# Transfer STX to generated wallets
MNEMONIC="your seed phrase" node transfer-stx.js 0.1

# Run bulk check-ins
node bulk-checkin.js checkin

# Check wallet status
node bulk-checkin.js status
```

## 📁 Project Structure

```
daily-checkin/
├── contracts/
│   └── daily-checkin.clar    # Main smart contract
├── tools/
│   ├── generate-wallets.js   # Generate multiple wallets
│   ├── transfer-stx.js       # Bulk STX transfers
│   ├── bulk-checkin.js       # Automated check-ins
│   └── wallets.json          # Generated wallets (gitignored)
├── web/
│   ├── index.html            # Frontend UI
│   ├── app.js                # Stacks Connect integration
│   └── style.css             # Styling
└── deployments/
    └── default.mainnet-plan.yaml
```

## 🔧 Contract Functions

### Public Functions

| Function | Description | Fee |
|----------|-------------|-----|
| `check-in` | Daily check-in to earn points | 0.001 STX |

### Read-Only Functions

| Function | Description |
|----------|-------------|
| `get-user-stats (principal)` | Get user's points, streak, and last check-in |
| `get-total-checkins` | Get total check-ins across all users |
| `can-check-in (principal)` | Check if user can check in now |

## 🛡️ Security

- `wallets.json` contains private keys - **NEVER commit this file**
- Use environment variables for sensitive data
- The contract owner receives check-in fees

## 📜 License

MIT

## 🔗 Links

- [Stacks Explorer](https://explorer.hiro.so/txid/SP31G2FZ5JN87BATZMP4ZRYE5F7WZQDNEXJ7G7X97.daily-checkin?chain=mainnet)
- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/clarity)
