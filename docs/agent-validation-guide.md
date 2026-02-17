# Agent Validation Layer Guide

## Overview

The agent validation layer provides signature-based authentication for wrapper API requests. It validates incoming requests against the Stacks blockchain registry before allowing access to the payment-gated APIs.

## Architecture

```
Client Request
    ↓
1. Extract Headers (x-agent-wallet, x-agent-signature, x-agent-timestamp, x-validator-txid)
    ↓
2. Fetch Transaction from Stacks API (using x-validator-txid)
    ↓
3. Validate Agent Wallet (check against allowed-agents list)
    ↓
4. Verify Signature (recreate canonical message and verify)
    ↓
5. If Valid → Continue to x402 Payment Middleware
   If Invalid → Return 403 Access Denied
```

## Required Headers

All requests to the wrapper API must include these headers:

| Header | Description | Example |
|--------|-------------|---------|
| `x-agent-wallet` | Stacks wallet address of the agent | `ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2` |
| `x-agent-signature` | RSV signature of the canonical message | `0x3045...` |
| `x-agent-timestamp` | Unix timestamp in milliseconds | `1771134315000` |
| `x-validator-txid` | Transaction ID from Stacks registry | `0xa4380d893019185efc652d52be08610bdc9fc0467a4d03347d0fcaeafdf76b2e` |

## Canonical Message Format

The canonical message is created using the following format:

```
{apiId}|{timestamp}|{timestamp}|{bodyHash}
```

Where:
- `apiId`: The API identifier from the URL path (`/w/:apiId/*`)
- `timestamp`: The value from `x-agent-timestamp` header (used twice as nonce)
- `bodyHash`: SHA256 hash of the JSON-stringified request body

### Example

```javascript
const bodyHash = sha256(JSON.stringify(req.body));
const message = `my-api-id|1771134315000|1771134315000|${bodyHash}`;
```

## Signature Creation (Client-Side)

To create a valid signature, clients must:

1. Create the canonical message
2. Sign it using their Stacks private key
3. Include the RSV signature in the `x-agent-signature` header

```javascript
import { signMessageHashRsv } from '@stacks/encryption';
import { createHash } from 'crypto';

// 1. Create body hash
const bodyHash = createHash('sha256')
  .update(JSON.stringify(requestBody))
  .digest('hex');

// 2. Create canonical message
const message = `${apiId}|${timestamp}|${timestamp}|${bodyHash}`;

// 3. Sign message
const signature = signMessageHashRsv({
  message,
  privateKey: yourPrivateKey
});

// 4. Include in request headers
const headers = {
  'x-agent-wallet': yourWalletAddress,
  'x-agent-signature': signature,
  'x-agent-timestamp': timestamp.toString(),
  'x-validator-txid': validatorTxId
};
```

## Stacks Registry Transaction

The `x-validator-txid` must reference a valid transaction on the Stacks blockchain that:

1. Calls the `api-registry` contract
2. Uses either `create-api` or `update-api` function
3. Has status `success`
4. Contains the following parameters:
   - `api-name`: Name of the API
   - `allowed-agents`: Comma-separated list of allowed wallet addresses
   - `cooldown-blocks`: Cooldown period in blocks
   - `verify-agent`: Boolean flag to enable/disable agent verification

### Example Transaction Data

```json
{
  "tx_id": "0xa4380d893019185efc652d52be08610bdc9fc0467a4d03347d0fcaeafdf76b2e",
  "tx_status": "success",
  "contract_call": {
    "contract_id": "ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry",
    "function_name": "create-api",
    "function_args": [
      {
        "name": "api-name",
        "repr": "\"my-api\"",
        "type": "(string-ascii 100)"
      },
      {
        "name": "allowed-agents",
        "repr": "u\"ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2,ST1WNVWY7WCJESTHM050RAMRRE44KJTKZKJCSRFCQ\"",
        "type": "(string-utf8 500)"
      },
      {
        "name": "cooldown-blocks",
        "repr": "u10",
        "type": "uint"
      },
      {
        "name": "verify-agent",
        "repr": "true",
        "type": "bool"
      }
    ]
  }
}
```

## Validation Flow

### 1. Header Extraction

The middleware extracts all required headers and validates their presence.

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_HEADERS",
    "message": "Missing required validation headers",
    "required": [
      "x-agent-wallet",
      "x-agent-signature",
      "x-agent-timestamp",
      "x-validator-txid"
    ]
  }
}
```

### 2. Transaction Fetching

The middleware fetches transaction data from the Stacks API using the provided `x-validator-txid`.

**API Endpoint:**
- Testnet: `https://api.testnet.hiro.so/extended/v1/address/ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry/transactions?limit=50`
- Mainnet: `https://api.mainnet.hiro.so/extended/v1/address/ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry/transactions?limit=50`

**Error Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TRANSACTION",
    "message": "Invalid or not found validator transaction"
  }
}
```

### 3. Agent Wallet Validation

If `verify-agent` is `true` in the transaction, the middleware checks if the `x-agent-wallet` is in the `allowed-agents` list.

**Error Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "AGENT_NOT_ALLOWED",
    "message": "Agent wallet is not authorized for this API"
  }
}
```

### 4. Signature Verification

The middleware recreates the canonical message and verifies the signature using the Stacks SDK.

**Error Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Agent signature verification failed"
  }
}
```

### 5. Success

If all validations pass, the request continues to the x402 payment middleware.

The validated data is attached to the request object:

```javascript
req.validatedAgent = {
  wallet: 'ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2',
  timestamp: '1771134315000',
  txId: '0xa4380d893019185efc652d52be08610bdc9fc0467a4d03347d0fcaeafdf76b2e',
  apiConfig: {
    apiName: 'my-api',
    allowedAgents: 'ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2',
    cooldownBlocks: 10,
    verifyAgent: true
  }
};
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Stacks Network Configuration
STACKS_NETWORK="testnet"  # or "mainnet"
```

### Network Selection

The middleware automatically selects the correct Stacks API endpoint based on the `STACKS_NETWORK` environment variable:

- `testnet`: Uses Hiro Testnet API
- `mainnet`: Uses Hiro Mainnet API

## Testing

### Example cURL Request

```bash
curl -X POST https://your-api.com/w/my-api-id/endpoint \
  -H "Content-Type: application/json" \
  -H "x-agent-wallet: ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2" \
  -H "x-agent-signature: 0x3045022100..." \
  -H "x-agent-timestamp: 1771134315000" \
  -H "x-validator-txid: 0xa4380d893019185efc652d52be08610bdc9fc0467a4d03347d0fcaeafdf76b2e" \
  -d '{"key": "value"}'
```

### Example Node.js Client

```javascript
import axios from 'axios';
import { signMessageHashRsv } from '@stacks/encryption';
import { createHash } from 'crypto';

async function callWrapperAPI(apiId, endpoint, body, privateKey, walletAddress, validatorTxId) {
  const timestamp = Date.now();
  
  // Create body hash
  const bodyHash = createHash('sha256')
    .update(JSON.stringify(body))
    .digest('hex');
  
  // Create canonical message
  const message = `${apiId}|${timestamp}|${timestamp}|${bodyHash}`;
  
  // Sign message
  const signature = signMessageHashRsv({
    message,
    privateKey
  });
  
  // Make request
  const response = await axios.post(
    `https://your-api.com/w/${apiId}${endpoint}`,
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-agent-wallet': walletAddress,
        'x-agent-signature': signature,
        'x-agent-timestamp': timestamp.toString(),
        'x-validator-txid': validatorTxId
      }
    }
  );
  
  return response.data;
}
```

## Security Considerations

1. **Timestamp Validation**: Consider adding timestamp expiration checks to prevent replay attacks
2. **Nonce Management**: The current implementation uses timestamp as nonce; consider implementing a proper nonce system
3. **Rate Limiting**: Implement rate limiting per agent wallet to prevent abuse
4. **Transaction Caching**: Cache transaction data to reduce API calls to Stacks blockchain
5. **Signature Algorithm**: Uses RSV signature format from Stacks SDK

## Error Handling

All validation errors return appropriate HTTP status codes:

- `400`: Missing or invalid headers
- `403`: Validation failed (unauthorized agent, invalid signature, etc.)
- `500`: Internal server error (unexpected errors)

## Logging

The middleware provides detailed console logging for debugging:

- 🔐 Starting validation
- 📋 Headers extracted
- 🔍 Fetching transaction data
- ✅ Transaction data parsed
- 🔍 Checking agent wallet
- ✅ Agent wallet authorized
- 📝 Canonical message created
- ✅ Signature verified
- ✅ Validation successful

## Integration

The validation middleware is automatically integrated into the wrapper handler at:

```
src/handlers/wrapperHandler.ts
```

It runs before the x402 payment middleware, ensuring only authorized agents can proceed to payment.

## Troubleshooting

### Common Issues

1. **Invalid Signature**: Ensure the canonical message format matches exactly
2. **Transaction Not Found**: Verify the transaction ID is correct and the transaction is confirmed
3. **Agent Not Allowed**: Check that the wallet address is in the allowed-agents list
4. **Network Mismatch**: Ensure STACKS_NETWORK matches the network where the transaction was created

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages in responses.
