# Agent Client Examples

This directory contains example code demonstrating how to interact with the wrapper API using agent signature validation.

## Files

- `agent-client-example.ts` - Complete example of making authenticated requests to the wrapper API

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Configure your credentials in `agent-client-example.ts`:
```typescript
const API_ID = 'your-api-id';
const VALIDATOR_TX_ID = '0x...'; // Your transaction ID from Stacks registry
const AGENT_WALLET = 'ST...'; // Your Stacks wallet address
const AGENT_PRIVATE_KEY = 'your-private-key'; // Your Stacks private key
```

## Running the Examples

```bash
npx ts-node examples/agent-client-example.ts
```

## Security Warning

⚠️ **NEVER commit your private keys to version control!**

Use environment variables or a secure key management system in production:

```typescript
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;
```

## How It Works

1. **Create Canonical Message**: Combines API ID, timestamp, and body hash
2. **Sign Message**: Uses Stacks private key to create RSV signature
3. **Add Headers**: Includes wallet, signature, timestamp, and validator TX ID
4. **Make Request**: Sends authenticated request to wrapper API

## Example Output

```
============================================================
Agent Client Example - Authenticated Wrapper API Requests
============================================================

📌 Example 1: GET Request

🚀 Making GET request to /w/my-api-id/users
⏰ Timestamp: 1771134315000
📝 Canonical message: my-api-id|1771134315000|1771134315000|e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
✍️ Signature created: 0x3045022100...
📋 Headers prepared: {
  x-agent-wallet: 'ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2',
  x-agent-timestamp: 1771134315000,
  x-validator-txid: '0xa4380d893019185e...'
}

✅ Response received:
Status: 200 OK
Data: {
  "users": [...]
}
```

## Integration in Your Application

```typescript
import { makeAuthenticatedRequest } from './examples/agent-client-example';

// Make authenticated API call
const result = await makeAuthenticatedRequest(
  'my-api-id',
  '/endpoint',
  'POST',
  { data: 'value' }
);
```

## Troubleshooting

### Invalid Signature Error

Ensure your canonical message format matches exactly:
```
{apiId}|{timestamp}|{timestamp}|{bodyHash}
```

### Agent Not Allowed Error

Verify your wallet address is in the allowed-agents list in the Stacks registry transaction.

### Transaction Not Found Error

Check that:
1. The transaction ID is correct
2. The transaction is confirmed on the blockchain
3. The STACKS_NETWORK environment variable matches the network

## Additional Resources

- [Agent Validation Guide](../docs/agent-validation-guide.md)
- [Stacks Documentation](https://docs.stacks.co/)
- [x402-stacks Package](https://www.npmjs.com/package/x402-stacks)
