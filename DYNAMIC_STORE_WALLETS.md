# Dynamic Store Wallet System

## 🏪 How It Works

Your Solana Pay system now supports **dynamic store wallets**. Each store owner has their own wallet address where they receive payments directly.

### Payment Flow:
```
Customer → Scans QR/Clicks Link → Pays → Store Owner's Wallet
```

## 💰 Wallet Address Sources

### For Store Owners:
- Each store owner provides their Solana wallet address when registering
- This address is stored in the `users.wallet_address` field
- Payments for their store go directly to their wallet

### For Customers:
- Customers use their own wallets (Phantom, Solflare, etc.)
- They scan the QR code or click the payment link
- Payment goes from customer wallet → store owner wallet

## 🔧 Technical Implementation

### Database Structure:
```sql
users.wallet_address → Store owner's receiving wallet
stores.owner_id → Links to user who owns the store
orders.customer_wallet → Customer's wallet (for reference only)
```

### Payment URL Generation:
```typescript
// Get store owner's wallet dynamically
const store = await getStoreWithOwnerWallet(storeId);
const storeOwnerWallet = new PublicKey(store.owner.walletAddress);

// Create payment request to store owner's wallet
const paymentRequest = {
  recipient: storeOwnerWallet, // Dynamic per store
  amount: totalAmount,
  reference: uniqueReference,
  // ...
};
```

## 📱 Example Payment URLs

### Store A (Owner: Alice):
```
solana:9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM?amount=2&reference=7zqHdFBPN1iqNiWqXP7xr71LAWPya9MfiqGe6tiA29nW&label=Alice's+Store&message=Purchase...
```

### Store B (Owner: Bob):
```
solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?amount=5&reference=5Mt2aEU63xmTUCMNYtrWjDqLGZmrWoeHKif1rB4nS8v7&label=Bob's+Electronics&message=Purchase...
```

## ✅ Benefits

1. **Decentralized**: No single point of failure
2. **Direct Payments**: Store owners receive funds immediately
3. **No Middleman**: No need to distribute funds later
4. **Scalable**: Supports unlimited stores
5. **Secure**: Each store owner controls their own funds

## 🚀 For Production

### Store Owner Requirements:
- Valid Solana mainnet wallet address
- Access to their wallet to receive payments
- Understanding that payments go directly to them

### System Requirements:
- ✅ No global wallet configuration needed
- ✅ Each store validated independently
- ✅ Payment verification per store owner
- ✅ Automatic routing to correct wallet

## 🔍 Verification Process

When a payment is made:
1. System looks up store owner's wallet address
2. Verifies payment went to correct wallet
3. Confirms transaction on Solana blockchain
4. Updates order status to completed

## 📊 Current Status

Your system now:
- ✅ Uses dynamic store owner wallets
- ✅ Generates unique references per payment
- ✅ Routes payments to correct store owners
- ✅ Verifies payments against store owner wallets
- ✅ Supports mainnet production use

No global wallet configuration needed - everything is dynamic per store!