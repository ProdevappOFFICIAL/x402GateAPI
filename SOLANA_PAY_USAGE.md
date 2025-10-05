# Solana Pay Integration Guide

This project includes two approaches to Solana Pay integration:

## 1. Simple Solana Pay API (Your Example)

The simple API (`/api/create-payment` and `/api/verify/:reference`) matches the code structure you provided.

### Create Payment
```bash
POST /api/create-payment
Content-Type: application/json

{
  "amount": 0.1
}
```

Response:
```json
{
  "orderId": "order_id_here",
  "solanaPayUrl": "solana:recipient=...&amount=0.1&reference=...",
  "reference": "reference_key_here"
}
```

### Verify Payment
```bash
GET /api/verify/REFERENCE_KEY
```

Response (success):
```json
{
  "success": true,
  "txSignature": "transaction_signature_here"
}
```

Response (pending):
```json
{
  "success": false,
  "message": "Payment not yet confirmed"
}
```

## 2. Advanced Store-based Checkout API

The advanced API (`/v1/stores/:storeId/checkout`) provides a complete e-commerce solution.

### Create Checkout Session
```bash
POST /v1/stores/STORE_ID/checkout
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 1,
  "customerWallet": "customer_wallet_address",
  "customerEmail": "customer@example.com",
  "currency": "SOL"
}
```

### Verify Payment
```bash
POST /v1/stores/STORE_ID/checkout/verify
Content-Type: application/json

{
  "orderId": "order_id_here"
}
```

### Get Order Status
```bash
GET /v1/stores/STORE_ID/checkout/ORDER_ID/status
```

## Environment Setup

Make sure you have these environment variables set:

```env
# Solana Configuration
SOLANA_NETWORK=devnet
STORE_WALLET_ADDRESS=your_merchant_wallet_address_here
PAYMENT_TIMEOUT=300

# Database
DATABASE_URL=your_postgresql_connection_string
```

## Key Features

### Simple API Features:
- ✅ Basic payment link creation
- ✅ Payment verification
- ✅ Order tracking in database
- ✅ Matches your provided example code

### Advanced API Features:
- ✅ Store and product management
- ✅ Inventory tracking
- ✅ Multiple currency support (SOL, USDC)
- ✅ Order expiration
- ✅ Stock reservation
- ✅ Customer management
- ✅ Comprehensive error handling

## Testing

Use the provided test files:
- `test-simple-solana-pay.rest` - Simple API tests
- `test-solana-checkout.rest` - Advanced API tests

## Implementation Notes

1. **Reference Generation**: Uses UUID v4 for unique payment references
2. **Payment Verification**: Uses Solana Pay's built-in `findReference` and `validateTransfer`
3. **Database Integration**: Stores orders and payment references in PostgreSQL via Prisma
4. **Error Handling**: Comprehensive error handling for all edge cases
5. **Security**: Validates wallet addresses and amounts before processing

## Next Steps

1. Replace `YOUR_MERCHANT_WALLET_ADDRESS_HERE` with your actual Solana wallet address
2. Set up your database and run Prisma migrations
3. Test with devnet first, then switch to mainnet for production
4. Implement frontend QR code generation using the returned payment URLs