# Deployment Guide

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Git
- Docker (optional)
- Stacks wallet with testnet STX

### Installation

```bash
# Clone repository
git clone https://github.com/phessophissy/daily-checkin.git
cd daily-checkin

# Install dependencies
npm install

# Install Clarinet for contract development
npm install -g @hirosystems/clarinet
```

### Development

```bash
# Start development server
npm run dev

# Run Clarity contract locally
clarinet check

# Test contract
clarinet test
```

### Environment Configuration

Create `.env.local`:

```env
VITE_API_BASE=http://localhost:3000
VITE_STACKS_NETWORK=testnet
VITE_CONTRACT_ADDRESS=SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09
VITE_APP_NAME=Daily Check-in
```

### Contract Deployment

#### Testnet

```bash
# Set wallet and network
export STACKS_API_URL=https://stacks-testnet-api.blockstack.org
export MNEMONIC="your twelve word seed phrase here"

# Deploy contract
clarinet deploy testnet

# Alternatively, use manual deployment
curl -X POST https://stacks-testnet-api.blockstack.org/v2/transactions \
  -H "Content-Type: application/json" \
  -d @contract-tx.json
```

#### Mainnet

```bash
# WARNING: Costs real STX
export STACKS_API_URL=https://stacks-api.blockstack.org
export MNEMONIC="your twelve word seed phrase here"

clarinet deploy mainnet
```

### Frontend Deployment

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

#### GitHub Pages

```bash
# Update package.json homepage
npm run build
npm run deploy
```

#### Docker

```bash
# Build image
docker build -t daily-checkin .

# Run container
docker run -p 3000:3000 daily-checkin

# Push to registry
docker tag daily-checkin:latest your-registry/daily-checkin:latest
docker push your-registry/daily-checkin:latest
```

### Production Checklist

- [ ] Update contract deployer in code
- [ ] Set production API URLs
- [ ] Enable analytics
- [ ] Configure error reporting
- [ ] Setup error logging
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Setup CDN for static assets
- [ ] Enable HTTPS/SSL
- [ ] Configure CSP headers
- [ ] Test all wallet connections
- [ ] Verify contract calls
- [ ] Load test the app
- [ ] Security audit
- [ ] Backup strategy in place

### Monitoring

#### Application Monitoring
```javascript
import { PerformanceMonitor } from './performance-monitor.js';

const monitor = new PerformanceMonitor();
const report = monitor.getReport();
console.log('Web Vitals:', report.vitals);
```

#### Error Tracking
```javascript
import { ErrorHandler } from './error-handler.js';

const errorHandler = new ErrorHandler({
  reportErrors: true,
  logErrors: true
});
```

#### Analytics
```javascript
import { AnalyticsTracker } from './forms.js';

const analytics = new AnalyticsTracker();
analytics.trackEvent('page_view', { path: window.location.pathname });
```

### Rollback Procedure

```bash
# If deployment fails, rollback to previous version
vercel rollback
# or
netlify deploy --alias rollback

# Check service worker
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(r => r.unregister()))
```

### Performance Optimization

1. **Asset Optimization**
   ```bash
   npm run build -- --minify
   ```

2. **Cache Busting**
   - Update CACHE_NAME in sw.js for new cache
   - Include version in file names

3. **Database Optimization**
   - Index frequently searched fields
   - Archive old records

4. **API Optimization**
   - Implement request caching
   - Use batch endpoints
   - Implement pagination

### Security Hardening

1. **API Security**
   - Rate limiting enabled
   - CORS properly configured
   - Input validation
   - SQL injection prevention

2. **Frontend Security**
   - CSP headers enabled
   - XSS protection
   - CSRF tokens
   - Secure session management

3. **Wallet Security**
   - Never store private keys
   - Use hardware wallet for mainnet
   - Validate contract addresses
   - Test with small amounts first

### Scaling

1. **Horizontal Scaling**
   - Use load balancer (AWS ALB, nginx)
   - Multiple app instances
   - Shared database

2. **Vertical Scaling**
   - Upgrade server resources
   - Optimize database queries
   - Implement caching layers

3. **Database**
   - Connection pooling
   - Query optimization
   - Replication for high availability

### Troubleshooting

#### Service Worker Issues
```javascript
// Clear service worker cache
caches.keys().then(names => 
  Promise.all(names.map(name => caches.delete(name)))
);
```

#### Wallet Connection Issues
```javascript
// Check wallet connection
navigator.xrpl?.request({
  method: 'getProvider'
}).then(provider => console.log(provider));
```

#### Contract Call Issues
```bash
# Verify contract is deployed
curl https://stacks-testnet-api.blockstack.org/v2/contracts/source/SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09/daily-checkin

# Check contract events
curl "https://stacks-testnet-api.blockstack.org/v2/contracts/events?contract_id=SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.daily-checkin"
```

### Support

- **Documentation**: See web/FRONTEND_DOCS.md
- **Issues**: https://github.com/phessophissy/daily-checkin/issues
- **Discussions**: https://github.com/phessophissy/daily-checkin/discussions
