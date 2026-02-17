# JWT Authentication Implementation Guide

## Current Status

The frontend has been updated to follow the API documentation which requires JWT token authentication for API key generation.

## What Was Changed

### `ApiKeyManager.tsx`
- Added `generateJWTToken()` function that:
  1. Signs a message with the user's Stacks wallet
  2. Sends the signature to backend for JWT token generation
  3. Returns the JWT token for API requests

- Updated `generateApiKey()` to:
  1. First generate a JWT token
  2. Use that JWT token to call `POST /apis/keys`
  3. Follow the exact API documentation format

## What's Missing (Backend Implementation Required)

### 1. JWT Token Generation Endpoint

You need to create this endpoint in your backend:

```typescript
POST /auth/token
Content-Type: application/json

{
  "walletAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "message": "x402Layer API Key Generation - 1708185600000",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### 2. Backend Implementation Steps

1. **Verify Stacks Signature**
   - Use `@stacks/encryption` to verify the signature
   - Ensure the message was signed by the claimed wallet address

2. **Generate JWT Token**
   - Use a library like `jsonwebtoken`
   - Include wallet address in the payload
   - Set expiration time (e.g., 1 hour)

3. **Example Backend Code** (Node.js/Express):

```typescript
import { verifyMessageSignature } from '@stacks/encryption';
import jwt from 'jsonwebtoken';

app.post('/auth/token', async (req, res) => {
  const { walletAddress, message, signature } = req.body;
  
  try {
    // Verify the signature
    const isValid = verifyMessageSignature({
      message,
      publicKey: signature.publicKey,
      signature: signature.data
    });
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid signature' }
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { walletAddress, network: 'testnet' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      token,
      expiresIn: 3600
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate token' }
    });
  }
});
```

4. **Update API Key Generation Endpoint**

Ensure `POST /apis/keys` validates the JWT token:

```typescript
import jwt from 'jsonwebtoken';

// Middleware to verify JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' }
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { walletAddress, network }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
    });
  }
}

// Apply middleware to API key generation
app.post('/apis/keys', authenticateJWT, async (req, res) => {
  const { name } = req.body;
  const { walletAddress } = req.user; // From JWT token
  
  // Generate API key...
  const apiKey = generateApiKey();
  
  // Save to database with walletAddress
  await db.apiKey.create({
    data: {
      key: apiKey,
      name,
      walletAddress,
      isActive: true
    }
  });
  
  res.status(201).json({
    success: true,
    data: {
      id: '...',
      key: apiKey,
      name,
      walletAddress,
      isActive: true,
      createdAt: new Date()
    },
    message: 'Store this API key securely. It will not be shown again.'
  });
});
```

## Alternative: Public Endpoint Approach

If you want to avoid JWT tokens and allow public API key generation (as your original implementation suggested), you can:

1. **Change the API documentation** to match the public endpoint approach
2. **Revert the frontend changes** to use `POST /apis/keys/generate` with just `walletAddress` and `name`
3. **Update backend** to support the public endpoint

This would be simpler but less secure for production use.

## Recommended Approach

For production: **Use JWT authentication** (current implementation)
- More secure
- Better control over who can generate API keys
- Prevents abuse

For development/testing: **Use public endpoint**
- Faster to implement
- No JWT infrastructure needed
- Good for prototyping

## Next Steps

1. Decide which approach you want (JWT or public endpoint)
2. Implement the backend accordingly
3. Test the API key generation flow
4. Update documentation to match implementation

## Testing the Current Implementation

Once you implement the backend JWT endpoint, test with:

```bash
# 1. Generate JWT token
curl -X POST http://localhost:4000/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "message": "test message",
    "signature": "..."
  }'

# 2. Use JWT to generate API key
curl -X POST http://localhost:4000/apis/keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "My App"}'
```
