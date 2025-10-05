# Solana Pay Integration

This document describes the Solana Pay integration for the SolStore API, enabling seamless cryptocurrency payments for products.

## Overview

The Solana Pay integration provides three main endpoints:
1. **Checkout Creation** - Creates a payment request and generates Solana Pay URL
2. **Payment Verification** - Verifies if payment has been completed on-chain
3. **Status Checking** - Gets current status of a checkout session

## Features

- ✅ SOL and SPL token payments (SOL, USDC)
- ✅ QR code compatible payment URLs
- ✅ Automatic stock management
- ✅ Payment verification via blockchain
- ✅ Order expiration handling
- ✅ Reference-based payment tracking

## API Endpoints

### 1. Create Checkout Session

**Endpoint:** `POST /v1/stores/{storeId}/checkout`

Creates a new checkout session and generates a Solana Pay URL for payment.

**Request Body:**
```json
{
  "productId": "string",
  "quantity": 1,
  "customerWallet": "string",
  "customerEmail": "string (optional)",
  "currency": "SOL | USDC"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order-uuid",
    "orderNumber": "#ORD-123456789",
    "paymentURL": "solana:recipient?amount=0.1&reference=...",
    "qrCode": "solana:recipient?amount=0.1&reference=...",
    "amount": "0.1",
    "currency": "SOL",
    "reference": "reference-public-key",
    "expiresAt": "2024-01-01T12:00:00.000Z",
    "product": {
      "id": "product-id",
      "name": "Product Name",
      "price": "0.1"
    },
    "store": {
      "id": "store-id",
      "name": "Store Name"
    }
  }
}
```

### 2. Verify Payment

**Endpoint:** `POST /v1/stores/{storeId}/checkout/verify`

Verifies if the payment has been completed on the Solana blockchain.

**Request Body:**
```json
{
  "orderId": "string",
  "signature": "string (optional)"
}
```

**Response (Payment Confirmed):**
```json
{
  "success": true,
  "data": {
    "orderId": "order-uuid",
    "orderNumber": "#ORD-123456789",
    "status": "completed",
    "paymentConfirmed": true,
    "transactionSignature": "signature-hash",
    "paidAmount": "0.1",
    "paidAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Response (Payment Pending):**
```json
{
  "success": true,
  "data": {
    "orderId": "order-uuid",
    "orderNumber": "#ORD-123456789",
    "status": "pending",
    "paymentConfirmed": false,
    "message": "Payment not yet confirmed"
  }
}
```

### 3. Get Checkout Status

**Endpoint:** `GET /v1/stores/{storeId}/checkout/{orderId}/status`

Retrieves the current status of a checkout session.

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order-uuid",
    "orderNumber": "#ORD-123456789",
    "status": "pending | completed | failed | expired",
    "amount": "0.1",
    "currency": "SOL",
    "paymentURL": "solana:recipient?amount=0.1&reference=...",
    "expiresAt": "2024-01-01T12:00:00.000Z",
    "transactionSignature": "signature-hash (if completed)",
    "items": [
      {
        "product": {
          "id": "product-id",
          "name": "Product Name",
          "price": "0.1"
        },
        "quantity": 1,
        "price": "0.1"
      }
    ],
    "createdAt": "2024-01-01T11:55:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Solana Configuration
SOLANA_NETWORK="devnet"
SOLANA_RPC_URL="https://api.devnet.solana.com"
STORE_WALLET_ADDRESS="Your-Store-Wallet-Public-Key"
PAYMENT_TIMEOUT="300"
```

### Supported Networks

- **Mainnet:** `mainnet-beta`
- **Devnet:** `devnet` (for testing)
- **Testnet:** `testnet`

### Supported Tokens

- **SOL:** Native Solana token
- **USDC:** USD Coin (EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)

## Usage Flow

### 1. Frontend Integration

```javascript
// Create checkout session
const response = await fetch('/v1/stores/store-id/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'product-id',
    quantity: 1,
    customerWallet: 'customer-wallet-address',
    customerEmail: 'customer@example.com',
    currency: 'SOL'
  })
});

const { data } = await response.json();

// Display QR code or payment URL
displayQRCode(data.paymentURL);

// Poll for payment verification
const checkPayment = async () => {
  const verifyResponse = await fetch('/v1/stores/store-id/checkout/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: data.orderId })
  });
  
  const result = await verifyResponse.json();
  
  if (result.data.paymentConfirmed) {
    // Payment successful
    showSuccess(result.data);
  } else {
    // Still pending, check again
    setTimeout(checkPayment, 5000);
  }
};

checkPayment();
```

### 2. Mobile Wallet Integration

The generated payment URL follows the Solana Pay specification and can be used with:

- **Phantom Wallet**
- **Solflare**
- **Glow Wallet**
- Any Solana Pay compatible wallet

### 3. QR Code Generation

```javascript
import QRCode from 'qrcode';

const generateQR = async (paymentURL) => {
  const qrCodeDataURL = await QRCode.toDataURL(paymentURL);
  return qrCodeDataURL;
};
```

## Security Considerations

1. **Payment Verification:** Always verify payments on-chain using the reference key
2. **Order Expiration:** Orders expire after 5 minutes to prevent stale payments
3. **Stock Management:** Stock is reserved during checkout and restored if payment fails
4. **Wallet Validation:** Customer wallet addresses are validated before creating orders

## Error Handling

### Common Error Codes

- `NOT_FOUND`: Store or product not found
- `PRODUCT_OUT_OF_STOCK`: Insufficient stock available
- `INVALID_WALLET`: Invalid customer wallet address
- `ORDER_EXPIRED`: Order has expired (5 minutes)
- `INVALID_ORDER`: Order missing payment reference

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_OUT_OF_STOCK",
    "message": "Insufficient stock available"
  }
}
```

## Testing

Use the provided `test-solana-checkout.rest` file to test the endpoints:

1. Update the variables with your store and product IDs
2. Create a checkout session
3. Use a Solana wallet to complete the payment
4. Verify the payment status

## Database Schema Updates

The integration adds a `metadata` JSON field to the `Order` model to store:

- Payment reference key
- Payment URL
- Expiration timestamp
- Additional payment-related data

## Dependencies

The integration requires these npm packages:

```json
{
  "@solana/pay": "^0.2.5",
  "@solana/web3.js": "^1.87.6",
  "@solana/spl-token": "^0.3.9",
  "bignumber.js": "^9.1.2"
}
```

## Production Deployment

1. Set `SOLANA_NETWORK` to `mainnet-beta`
2. Use a production RPC endpoint
3. Set your actual store wallet address
4. Consider implementing webhook notifications for payment confirmations
5. Add proper logging and monitoring

## Support

For issues or questions about the Solana Pay integration, please refer to:

- [Solana Pay Documentation](https://docs.solanapay.com/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Documentation](https://spl.solana.com/token)