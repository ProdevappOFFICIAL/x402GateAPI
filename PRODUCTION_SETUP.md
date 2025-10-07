# Production Setup Guide

## 🚀 Mainnet Production Configuration

### 1. Environment Configuration

**CRITICAL**: Before deploying to production, you MUST update these values in your `.env` file:

#### Required Changes:

1. **Solana Wallet Address**:

   ```env
   STORE_WALLET_ADDRESS="YOUR_ACTUAL_MAINNET_WALLET_ADDRESS"
   ```

   - Get this from your Solana wallet (Phantom, Solflare, etc.)
   - Example format: `9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM`

2. **JWT Secret**:

   ```env
   JWT_SECRET="your-super-secure-random-string-at-least-32-characters"
   ```

   - Generate a strong random string
   - Use: `openssl rand -base64 32` or online generator

3. **Database URL**:
   ```env
   DATABASE_URL="your-production-postgresql-url"
   ```

### 2. Recommended Production RPC Providers

For better reliability and performance, consider using a dedicated RPC provider:

#### Helius (Recommended)

```env
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"
```

#### QuickNode

```env
SOLANA_RPC_URL="https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_TOKEN/"
```

#### Alchemy

```env
SOLANA_RPC_URL="https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
```

### 3. Security Checklist

- [ ] Updated `STORE_WALLET_ADDRESS` with your actual mainnet wallet
- [ ] Changed `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV="production"`
- [ ] Updated database URL for production
- [ ] Configured CORS for your frontend domain
- [ ] Set up rate limiting
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging

### 4. Testing Before Going Live

1. **Test with Small Amounts First**:

   - Start with 0.001 SOL transactions
   - Verify payments are received correctly
   - Test the complete checkout flow

2. **Verify Payment URLs**:

   - Check that generated URLs use your wallet address
   - Ensure references are valid Solana public keys
   - Test QR code scanning with Solana wallets

3. **Monitor Transactions**:
   - Use Solana Explorer to verify transactions
   - Check your wallet balance updates
   - Verify order status updates correctly

### 5. Deployment Commands

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Build for production (if using TypeScript compilation)
npm run build

# Start production server
npm start
```

### 6. Monitoring

Monitor these metrics in production:

- Payment success rate
- Transaction confirmation times
- API response times
- Error rates
- Wallet balance changes

### 7. Backup and Recovery

- Backup your database regularly
- Keep your wallet private keys secure
- Have a disaster recovery plan
- Monitor for failed transactions

## ⚠️ Important Notes

1. **Never share your private keys** - only use public wallet addresses
2. **Test thoroughly** before processing real payments
3. **Start with small amounts** to verify everything works
4. **Monitor transactions** closely in the first few days
5. **Have customer support** ready for payment issues

## 🔧 Current Configuration Status

Your app is now configured for mainnet with:

- ✅ Mainnet network settings
- ✅ Production environment
- ✅ Mainnet token addresses (SOL, USDC, USDT)
- ⚠️ **NEEDS**: Your actual wallet address
- ⚠️ **NEEDS**: Strong JWT secret

## Next Steps

1. Replace placeholder values in `.env`
2. Test with small amounts
3. Deploy to production
4. Monitor and verify payments
