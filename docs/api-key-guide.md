# API Key Guide - Third-Party Access

This guide explains how to use API keys for third-party access to your x402Layer APIs without requiring login.

## Overview

API keys allow external users and applications to:
- View your registered APIs
- Call your wrapped APIs
- Access API metrics
- All while tracking their usage

## For API Owners

### 1. Generate an API Key

First, login and get your JWT token, then generate an API key:

```bash
POST /apis/keys
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "My Frontend App"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "key": "x402_a1b2c3d4e5f6...",
    "name": "My Frontend App",
    "isActive": true,
    "createdAt": "2026-02-17T00:00:00.000Z"
  },
  "message": "Store this API key securely. It will not be shown again."
}
```

**Important:** Save the `key` value - it won't be shown again!

### 2. List Your API Keys

```bash
GET /apis/keys
Authorization: Bearer YOUR_JWT_TOKEN
```

Response shows masked keys:
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "name": "My Frontend App",
      "keyPreview": "x402_a1b2c3...d4e5",
      "isActive": true,
      "lastUsedAt": "2026-02-17T12:30:00.000Z",
      "createdAt": "2026-02-17T00:00:00.000Z"
    }
  ]
}
```

### 3. Track API Key Usage

```bash
GET /apis/keys/:keyId/usage
Authorization: Bearer YOUR_JWT_TOKEN
```

Response:
```json
{
  "success": true,
  "data": {
    "apiKeyId": "clx123...",
    "name": "My Frontend App",
    "totalRequests": 150,
    "successfulRequests": 145,
    "failedRequests": 5,
    "lastUsedAt": "2026-02-17T12:30:00.000Z",
    "requestsByApi": [
      {
        "apiId": "api_abc123",
        "count": 100
      },
      {
        "apiId": "api_xyz789",
        "count": 50
      }
    ]
  }
}
```

### 4. Revoke an API Key

```bash
DELETE /apis/keys/:keyId
Authorization: Bearer YOUR_JWT_TOKEN
```

## For Third-Party Users

### Using an API Key

Include the API key in the `X-API-Key` header for all requests:

```bash
# Create a new API
POST /apis
X-API-Key: x402_a1b2c3d4e5f6...
Content-Type: application/json

{
  "name": "My API",
  "originalUrl": "https://api.example.com",
  "pricePerRequest": 0.5,
  "network": "TESTNET",
  "facilitatorUrl": "https://facilitator.example.com",
  "stacksAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
}

# List all APIs
GET /apis
X-API-Key: x402_a1b2c3d4e5f6...

# Get specific API details
GET /apis/:apiId
X-API-Key: x402_a1b2c3d4e5f6...

# Update an API
PATCH /apis/:apiId
X-API-Key: x402_a1b2c3d4e5f6...
Content-Type: application/json

{
  "pricePerRequest": 1.0,
  "isActive": true
}

# Delete an API
DELETE /apis/:apiId
X-API-Key: x402_a1b2c3d4e5f6...

# Get API metrics
GET /apis/:apiId/metrics
X-API-Key: x402_a1b2c3d4e5f6...

# Call a wrapped API
GET /w/:apiId/endpoint
X-API-Key: x402_a1b2c3d4e5f6...
Payment-Signature: ...
```

### Frontend Example

```javascript
const API_KEY = 'x402_a1b2c3d4e5f6...';
const BASE_URL = 'https://your-api.com';

// Fetch all available APIs
async function listApis() {
  const response = await fetch(`${BASE_URL}/apis`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  
  const data = await response.json();
  return data.data; // Array of APIs
}

// Get specific API details
async function getApi(apiId) {
  const response = await fetch(`${BASE_URL}/apis/${apiId}`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  
  return await response.json();
}

// Call a wrapped API (with payment)
async function callWrappedApi(apiId, endpoint, paymentSignature) {
  const response = await fetch(`${BASE_URL}/w/${apiId}${endpoint}`, {
    headers: {
      'X-API-Key': API_KEY,
      'Payment-Signature': paymentSignature
    }
  });
  
  return await response.json();
}
```

## Authentication Methods Comparison

| Method | Use Case | Required For |
|--------|----------|--------------|
| JWT Token | Your own users | Create, Update, Delete APIs |
| API Key | Third-party access | Read APIs, Call wrapped APIs |
| None | Public access | N/A (not available) |

## Endpoint Access Matrix

| Endpoint | JWT Token | API Key | No Auth |
|----------|-----------|---------|---------|
| POST /apis | ✅ | ✅ | ❌ |
| GET /apis | ✅ | ✅ | ❌ |
| GET /apis/:id | ✅ | ✅ | ❌ |
| GET /apis/:id/metrics | ✅ | ✅ | ❌ |
| PATCH /apis/:id | ✅ | ✅ | ❌ |
| DELETE /apis/:id | ✅ | ✅ | ❌ |
| POST /apis/keys | ✅ | ❌ | ❌ |
| GET /apis/keys | ✅ | ❌ | ❌ |
| DELETE /apis/keys/:id | ✅ | ❌ | ❌ |
| GET /w/:id/* | ✅ | ✅ | ❌ |

**Note:** API keys now have full CRUD access. APIs created with an API key are associated with the key owner's account.

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables** to store API keys
3. **Rotate keys regularly** for production use
4. **Revoke compromised keys immediately**
5. **Use different keys** for different applications
6. **Monitor usage** to detect anomalies

## Tracking User Data from Frontend

Yes! When you use an API key, the system tracks:
- Total requests made with that key
- Success/failure rates
- Which APIs were accessed
- Last usage timestamp
- Per-API usage breakdown

This allows you to:
- Monitor third-party usage
- Identify popular APIs
- Detect abuse or anomalies
- Bill based on usage (future feature)
- Analyze user behavior

## Next Steps

1. Run database migration: `npx prisma migrate dev`
2. Generate an API key for your frontend
3. Update your frontend to use the API key
4. Monitor usage through the `/apis/keys/:id/usage` endpoint
