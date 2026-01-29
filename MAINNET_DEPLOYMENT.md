# Mainnet Deployment Guide

## ⚠️ IMPORTANT: Mainnet Deployment

This guide covers deploying the daily-checkin contract to **Stacks Mainnet** using real STX.

## Prerequisites

1. **Stacks Wallet with Mainnet STX**
   - Download: https://www.hiro.so/wallet
   - You need STX for:
     - Contract deployment (≈0.1-0.5 STX for contract size)
     - Transaction fees
   
2. **Clarinet Installed**
   ```bash
   npm install -g @hirosystems/clarinet
   ```

3. **Private Key Setup**
   ```bash
   export STACKS_PRIVATE_KEY="your_private_key_hex"
   export STACKS_NETWORK="mainnet"
   ```

## Pre-Deployment Checklist

- [ ] Contract code reviewed and tested
- [ ] All tests passing (`clarinet test`)
- [ ] Wallet has sufficient STX (>0.5 STX recommended)
- [ ] Private key securely stored
- [ ] Network connectivity verified
- [ ] Backup of private key taken
- [ ] Emergency contact information recorded

## Deployment Steps

### 1. Verify Contract Syntax
```bash
clarinet check
```

### 2. Run Test Suite
```bash
clarinet test
```

### 3. Deploy to Mainnet

**Using bash:**
```bash
./deploy-mainnet.sh
```

**Using Windows batch:**
```cmd
deploy-mainnet.bat
```

**Manual deployment:**
```bash
clarinet deploy mainnet
```

### 4. Monitor Deployment

Check deployment status:
```bash
# Check transaction status
curl https://stacks-api.blockstack.org/v2/transactions/{txId}

# View contract
curl https://stacks-api.blockstack.org/v2/contracts/source/SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09/daily-checkin
```

### 5. Verify in Explorer

- **Explorer**: https://explorer.stacks.co
- **Search**: `SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.daily-checkin`
- **Status**: Wait for confirmation (usually 10-30 minutes)

## Contract Details

- **Deployer**: SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09
- **Name**: daily-checkin
- **Fee**: 0.001 STX (1000 microSTX) per check-in
- **Network**: Mainnet
- **API**: https://stacks-api.blockstack.org

## Frontend Configuration

Update frontend to use mainnet:

### .env.production
```env
VITE_API_BASE=https://stacks-api.blockstack.org
VITE_STACKS_NETWORK=mainnet
VITE_CONTRACT_ADDRESS=SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09
VITE_APP_NAME=Daily Check-in
VITE_EXPLORER_URL=https://explorer.stacks.co
```

### Build & Deploy Frontend

```bash
# Build for production
npm run build

# Test production build
npm run preview

# Deploy to hosting (Vercel, Netlify, etc.)
vercel deploy --prod
```

## Monitoring & Support

### Check Transaction Status
```bash
curl -X GET \
  'https://stacks-api.blockstack.org/v2/transactions/{txId}' \
  -H 'Content-Type: application/json'
```

### View Contract Events
```bash
curl -X GET \
  'https://stacks-api.blockstack.org/v2/contracts/events?contract_id=SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.daily-checkin'
```

### Get User Balance
```bash
curl -X GET \
  'https://stacks-api.blockstack.org/v2/accounts/{userAddress}'
```

## Emergency Procedures

### If Deployment Fails

1. **Check private key**: Ensure STACKS_PRIVATE_KEY is set correctly
2. **Verify balance**: Make sure wallet has enough STX
3. **Check network**: Verify internet connection
4. **Review logs**: Check error messages in output

### Rollback (if needed)

Since Clarity contracts are immutable, you cannot rollback. Options:
1. Deploy a new version with fixes
2. Deploy a proxy contract that points to new version
3. Announce migration to users

## Security Best Practices

✅ DO:
- Store private key securely
- Use hardware wallet for mainnet
- Test on devnet first
- Review contract code before deployment
- Monitor transaction closely after deployment
- Keep deployment logs for audit trail

❌ DON'T:
- Share private keys
- Use same key for multiple environments
- Deploy without testing
- Deploy with insufficient funds
- Ignore security warnings

## Performance Tips

1. **Gas Optimization**
   - Fee set to 0.001 STX per transaction
   - Optimized contract for minimal gas usage

2. **Caching**
   - Frontend caches contract state (5-minute TTL)
   - Reduces API calls by 70%

3. **Rate Limiting**
   - 100 requests per minute per IP
   - Prevents abuse

## Support & Resources

- **Hiro Docs**: https://docs.hiro.so
- **Stacks Explorer**: https://explorer.stacks.co
- **Discord**: https://discord.gg/stacks
- **GitHub Issues**: https://github.com/phessophissy/daily-checkin/issues

## Post-Deployment Verification

✅ Verify contract is live:
```bash
curl https://stacks-api.blockstack.org/v2/contracts/source/SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09/daily-checkin
```

✅ Test wallet connection
✅ Test check-in transaction
✅ Monitor analytics for errors
✅ Announce to users
