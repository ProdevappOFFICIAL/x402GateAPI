# Frontend API Reference - Complete CRUD Guide

Complete API documentation for frontend developers to integrate with x402Layer.

## Base URL

```
Production: https://your-domain.com
Development: http://localhost:4000
```

## Authentication

All endpoints support two authentication methods:

### Method 1: JWT Token (for logged-in users)
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Method 2: API Key (for third-party/public access)
```http
X-API-Key: x402_your_api_key_here
```

---

## 📋 API Endpoints

### 1. Generate API Key (Public - No Login Required!)

Create a new API key without any authentication. Just provide your wallet address!

**Endpoint:** `POST /apis/keys/generate`  
**Auth Required:** NONE ✨  
**Description:** Generate an API key to use for all other operations

#### Request

```http
POST /apis/keys/generate
Content-Type: application/json

{
  "walletAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "name": "My Frontend App"
}
```

#### Request Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| walletAddress | string | Yes | Your Stacks wallet address |
| name | string | No | Display name for the API key |

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "key": "x402_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "name": "My Frontend App",
    "walletAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "isActive": true,
    "createdAt": "2026-02-17T10:30:00.000Z"
  },
  "message": "Store this API key securely. It will not be shown again."
}
```

#### JavaScript Example

```javascript
async function generateApiKey(walletAddress, keyName = 'My App') {
  const response = await fetch('http://localhost:4000/apis/keys/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      walletAddress,
      name: keyName 
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // IMPORTANT: Save this key securely!
    localStorage.setItem('x402_api_key', data.data.key);
    console.log('✅ API Key generated:', data.data.key);
    return data.data.key;
  } else {
    throw new Error(data.error.message);
  }
}

// Usage - No login required!
const apiKey = await generateApiKey('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'My App');
console.log('API Key:', apiKey);

// Now use this key for all other operations
```

#### React Hook Example

```javascript
import { useState } from 'react';

function useApiKey() {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('x402_api_key')
  );

  async function generateKey(walletAddress, name) {
    try {
      const response = await fetch('http://localhost:4000/apis/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, name })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('x402_api_key', data.data.key);
        setApiKey(data.data.key);
        return data.data.key;
      }
    } catch (error) {
      console.error('Failed to generate API key:', error);
      throw error;
    }
  }

  return { apiKey, generateKey };
}

// Usage in component
function App() {
  const { apiKey, generateKey } = useApiKey();
  const walletAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

  if (!apiKey) {
    return (
      <button onClick={() => generateKey(walletAddress, 'My App')}>
        Generate API Key
      </button>
    );
  }

  return <div>API Key: {apiKey}</div>;
}
```

---

### 2. List API Keys

View all your API keys (keys are masked for security).

**Endpoint:** `GET /apis/keys`  
**Auth Required:** JWT Token only

#### Request

```http
GET /apis/keys
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "clx123abc456",
      "name": "My Frontend App",
      "keyPreview": "x402_a1b2c3...x4y5z6",
      "isActive": true,
      "lastUsedAt": "2026-02-17T12:45:00.000Z",
      "createdAt": "2026-02-17T10:30:00.000Z"
    }
  ]
}
```

#### JavaScript Example

```javascript
async function listApiKeys(jwtToken) {
  const response = await fetch('http://localhost:4000/apis/keys', {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  });
  
  return await response.json();
}
```

---

### 3. Get API Key Usage Stats

Track how your API key is being used.

**Endpoint:** `GET /apis/keys/:keyId/usage`  
**Auth Required:** JWT Token only

#### Request

```http
GET /apis/keys/clx123abc456/usage
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "apiKeyId": "clx123abc456",
    "name": "My Frontend App",
    "totalRequests": 1250,
    "successfulRequests": 1200,
    "failedRequests": 50,
    "lastUsedAt": "2026-02-17T12:45:00.000Z",
    "requestsByApi": [
      {
        "apiId": "api_weather_001",
        "count": 800
      },
      {
        "apiId": "api_stocks_002",
        "count": 450
      }
    ]
  }
}
```

#### JavaScript Example

```javascript
async function getApiKeyUsage(jwtToken, keyId) {
  const response = await fetch(`http://localhost:4000/apis/keys/${keyId}/usage`, {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  });
  
  return await response.json();
}
```

---

### 4. Revoke API Key

Disable an API key (cannot be undone).

**Endpoint:** `DELETE /apis/keys/:keyId`  
**Auth Required:** JWT Token only

#### Request

```http
DELETE /apis/keys/clx123abc456
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

#### JavaScript Example

```javascript
async function revokeApiKey(jwtToken, keyId) {
  const response = await fetch(`http://localhost:4000/apis/keys/${keyId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  });
  
  return await response.json();
}
```

---

## 🔧 API Management (CRUD)

All endpoints below support both JWT and API Key authentication.

---

### 5. Create API

Register a new API wrapper.

**Endpoint:** `POST /apis`  
**Auth Required:** JWT Token OR API Key

#### Request

```http
POST /apis
X-API-Key: x402_your_api_key_here
Content-Type: application/json

{
  "name": "Weather API",
  "originalUrl": "https://api.weather.com",
  "pricePerRequest": 0.5,
  "minPrice": 0.1,
  "maxPrice": 10,
  "network": "TESTNET",
  "facilitatorUrl": "https://facilitator.example.com",
  "stacksAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
}
```

#### Request Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Display name for your API |
| originalUrl | string | Yes | The original API endpoint URL |
| pricePerRequest | number | Yes | Price in STX per request |
| minPrice | number | No | Minimum allowed price (default: 1) |
| maxPrice | number | No | Maximum allowed price (default: 1000) |
| network | string | Yes | "TESTNET" or "MAINNET" |
| facilitatorUrl | string | Yes | x402 facilitator URL |
| stacksAddress | string | Yes | Your Stacks wallet address |

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "apiId": "clx789xyz123",
    "name": "Weather API",
    "originalUrl": "https://api.weather.com",
    "wrapperUrl": "http://localhost:4000/w/clx789xyz123",
    "pricePerRequest": 0.5,
    "minPrice": 0.1,
    "maxPrice": 10,
    "network": "TESTNET",
    "facilitatorUrl": "https://facilitator.example.com",
    "stacksAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "isActive": true,
    "createdAt": "2026-02-17T10:30:00.000Z"
  }
}
```

#### JavaScript Example

```javascript
async function createApi(apiKey, apiData) {
  const response = await fetch('http://localhost:4000/apis', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('API Created:', data.data.wrapperUrl);
    return data.data;
  } else {
    throw new Error(data.error.message);
  }
}

// Usage
const newApi = await createApi('x402_your_key', {
  name: 'Weather API',
  originalUrl: 'https://api.weather.com',
  pricePerRequest: 0.5,
  network: 'TESTNET',
  facilitatorUrl: 'https://facilitator.example.com',
  stacksAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
});
```

---

### 6. List All APIs

Get all APIs associated with your account.

**Endpoint:** `GET /apis`  
**Auth Required:** JWT Token OR API Key

#### Request

```http
GET /apis
X-API-Key: x402_your_api_key_here
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "apiId": "clx789xyz123",
      "name": "Weather API",
      "originalUrl": "https://api.weather.com",
      "wrapperUrl": "http://localhost:4000/w/clx789xyz123",
      "pricePerRequest": 0.5,
      "minPrice": 0.1,
      "maxPrice": 10,
      "network": "TESTNET",
      "facilitatorUrl": "https://facilitator.example.com",
      "stacksAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      "isActive": true,
      "createdAt": "2026-02-17T10:30:00.000Z"
    }
  ]
}
```

#### JavaScript Example

```javascript
async function listApis(apiKey) {
  const response = await fetch('http://localhost:4000/apis', {
    headers: {
      'X-API-Key': apiKey
    }
  });
  
  const data = await response.json();
  return data.data; // Array of APIs
}

// Usage
const apis = await listApis('x402_your_key');
console.log(`Found ${apis.length} APIs`);
```

---

### 7. Get Single API

Get details for a specific API.

**Endpoint:** `GET /apis/:apiId`  
**Auth Required:** JWT Token OR API Key

#### Request

```http
GET /apis/clx789xyz123
X-API-Key: x402_your_api_key_here
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "apiId": "clx789xyz123",
    "name": "Weather API",
    "originalUrl": "https://api.weather.com",
    "wrapperUrl": "http://localhost:4000/w/clx789xyz123",
    "pricePerRequest": 0.5,
    "minPrice": 0.1,
    "maxPrice": 10,
    "network": "TESTNET",
    "facilitatorUrl": "https://facilitator.example.com",
    "stacksAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "isActive": true,
    "createdAt": "2026-02-17T10:30:00.000Z"
  }
}
```

#### JavaScript Example

```javascript
async function getApi(apiKey, apiId) {
  const response = await fetch(`http://localhost:4000/apis/${apiId}`, {
    headers: {
      'X-API-Key': apiKey
    }
  });
  
  const data = await response.json();
  return data.data;
}
```

---

### 8. Update API

Update API configuration (price, status, etc.).

**Endpoint:** `PATCH /apis/:apiId`  
**Auth Required:** JWT Token OR API Key

#### Request

```http
PATCH /apis/clx789xyz123
X-API-Key: x402_your_api_key_here
Content-Type: application/json

{
  "pricePerRequest": 1.0,
  "isActive": true
}
```

#### Request Body Parameters (all optional)

| Field | Type | Description |
|-------|------|-------------|
| pricePerRequest | number | New price per request |
| minPrice | number | New minimum price |
| maxPrice | number | New maximum price |
| isActive | boolean | Enable/disable the API |
| network | string | "TESTNET" or "MAINNET" |
| facilitatorUrl | string | New facilitator URL |
| stacksAddress | string | New Stacks address |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "apiId": "clx789xyz123",
    "name": "Weather API",
    "originalUrl": "https://api.weather.com",
    "wrapperUrl": "http://localhost:4000/w/clx789xyz123",
    "pricePerRequest": 1.0,
    "minPrice": 0.1,
    "maxPrice": 10,
    "network": "TESTNET",
    "facilitatorUrl": "https://facilitator.example.com",
    "stacksAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "isActive": true,
    "createdAt": "2026-02-17T10:30:00.000Z"
  }
}
```

#### JavaScript Example

```javascript
async function updateApi(apiKey, apiId, updates) {
  const response = await fetch(`http://localhost:4000/apis/${apiId}`, {
    method: 'PATCH',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  const data = await response.json();
  return data.data;
}

// Usage - Update price
await updateApi('x402_your_key', 'clx789xyz123', {
  pricePerRequest: 1.0
});

// Usage - Disable API
await updateApi('x402_your_key', 'clx789xyz123', {
  isActive: false
});
```

---

### 9. Delete API

Permanently delete an API wrapper.

**Endpoint:** `DELETE /apis/:apiId`  
**Auth Required:** JWT Token OR API Key

#### Request

```http
DELETE /apis/clx789xyz123
X-API-Key: x402_your_api_key_here
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "API deleted successfully",
  "data": {
    "apiId": "clx789xyz123",
    "name": "Weather API"
  }
}
```

#### JavaScript Example

```javascript
async function deleteApi(apiKey, apiId) {
  const response = await fetch(`http://localhost:4000/apis/${apiId}`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': apiKey
    }
  });
  
  return await response.json();
}

// Usage
await deleteApi('x402_your_key', 'clx789xyz123');
console.log('API deleted');
```

---

### 10. Get API Metrics

View usage statistics and revenue for an API.

**Endpoint:** `GET /apis/:apiId/metrics`  
**Auth Required:** JWT Token OR API Key

#### Request

```http
GET /apis/clx789xyz123/metrics
X-API-Key: x402_your_api_key_here
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "apiId": "clx789xyz123",
    "apiName": "Weather API",
    "metrics": {
      "totalRequests": 1500,
      "successfulRequests": 1450,
      "failedRequests": 50,
      "successRate": 96.67,
      "totalRevenue": 725.0
    }
  }
}
```

#### JavaScript Example

```javascript
async function getApiMetrics(apiKey, apiId) {
  const response = await fetch(`http://localhost:4000/apis/${apiId}/metrics`, {
    headers: {
      'X-API-Key': apiKey
    }
  });
  
  const data = await response.json();
  return data.data.metrics;
}

// Usage
const metrics = await getApiMetrics('x402_your_key', 'clx789xyz123');
console.log(`Success Rate: ${metrics.successRate}%`);
console.log(`Total Revenue: ${metrics.totalRevenue} STX`);
```

---

## 🚀 Complete React Example

```jsx
import React, { useState, useEffect } from 'react';

const API_KEY = process.env.REACT_APP_X402_API_KEY;
const BASE_URL = 'http://localhost:4000';

function ApiManager() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all APIs on mount
  useEffect(() => {
    fetchApis();
  }, []);

  async function fetchApis() {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/apis`, {
        headers: { 'X-API-Key': API_KEY }
      });
      const data = await response.json();
      
      if (data.success) {
        setApis(data.data);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createApi(apiData) {
    try {
      const response = await fetch(`${BASE_URL}/apis`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setApis([...apis, data.data]);
        alert('API created successfully!');
      } else {
        alert('Error: ' + data.error.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function updateApi(apiId, updates) {
    try {
      const response = await fetch(`${BASE_URL}/apis/${apiId}`, {
        method: 'PATCH',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setApis(apis.map(api => 
          api.apiId === apiId ? data.data : api
        ));
        alert('API updated successfully!');
      } else {
        alert('Error: ' + data.error.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function deleteApi(apiId) {
    if (!confirm('Are you sure you want to delete this API?')) return;
    
    try {
      const response = await fetch(`${BASE_URL}/apis/${apiId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': API_KEY }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setApis(apis.filter(api => api.apiId !== apiId));
        alert('API deleted successfully!');
      } else {
        alert('Error: ' + data.error.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function handleCreate() {
    const name = prompt('API Name:');
    if (!name) return;
    
    const url = prompt('Original URL:');
    if (!url) return;
    
    const price = parseFloat(prompt('Price per request (STX):'));
    if (isNaN(price)) return;
    
    const address = prompt('Stacks Address:');
    if (!address) return;
    
    createApi({
      name,
      originalUrl: url,
      pricePerRequest: price,
      network: 'TESTNET',
      facilitatorUrl: 'https://facilitator.example.com',
      stacksAddress: address
    });
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="api-manager">
      <h1>API Manager</h1>
      
      <button onClick={handleCreate} className="btn-create">
        ➕ Create New API
      </button>

      <div className="api-grid">
        {apis.map(api => (
          <div key={api.apiId} className="api-card">
            <h2>{api.name}</h2>
            <p><strong>Wrapper URL:</strong> {api.wrapperUrl}</p>
            <p><strong>Price:</strong> {api.pricePerRequest} STX</p>
            <p><strong>Network:</strong> {api.network}</p>
            <p>
              <strong>Status:</strong>{' '}
              {api.isActive ? '🟢 Active' : '🔴 Inactive'}
            </p>
            
            <div className="api-actions">
              <button onClick={() => {
                const newPrice = parseFloat(prompt('New price:', api.pricePerRequest));
                if (!isNaN(newPrice)) {
                  updateApi(api.apiId, { pricePerRequest: newPrice });
                }
              }}>
                ✏️ Edit Price
              </button>
              
              <button onClick={() => {
                updateApi(api.apiId, { isActive: !api.isActive });
              }}>
                {api.isActive ? '⏸️ Disable' : '▶️ Enable'}
              </button>
              
              <button onClick={() => deleteApi(api.apiId)} className="btn-danger">
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApiManager;
```

---

## 📊 Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| API_KEY_REQUIRED | 401 | X-API-Key header missing |
| INVALID_API_KEY | 401 | API key not found or invalid |
| API_KEY_DISABLED | 401 | API key has been revoked |
| NOT_FOUND | 404 | API not found or no permission |
| VALIDATION_ERROR | 400 | Invalid request data |
| DUPLICATE_ENTRY | 409 | API already exists |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

## 🔒 Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables** for API keys
3. **Rotate keys regularly** in production
4. **Revoke compromised keys immediately**
5. **Use HTTPS** in production
6. **Validate all user input** before sending to API
7. **Handle errors gracefully** in your UI

---

## 📦 Quick Start Checklist (No Login Required!)

- [ ] Get your Stacks wallet address
- [ ] Generate API key using `POST /apis/keys/generate` (no login!)
- [ ] Store API key securely (localStorage or environment variable)
- [ ] Create your first API using `POST /apis`
- [ ] Test the wrapper URL
- [ ] Monitor usage with `GET /apis/:id/metrics`

**That's it! No login, no JWT tokens, just your wallet address and API key.**

---

## 🆘 Need Help?

- Check error messages in the response
- Verify your API key is active
- Ensure all required fields are provided
- Check network connectivity
- Review the JavaScript examples above

Happy coding! 🚀
