# x402Gate API - Frontend Implementation Guide

> Complete API documentation for integrating with the x402Gate payment-gated API platform

## Base URL

```
Development: http://localhost:4000
Production: [Your production URL]
```

## API Versioning

All API endpoints are prefixed with `/v1/`

## Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## Authentication

### Overview
x402Gate uses JWT (JSON Web Token) for authentication. After successful registration or login, you'll receive a token that must be included in subsequent requests.

### Including the Token
Add the token to the `Authorization` header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Endpoints


## 1. Authentication Endpoints

### 1.1 Register User

Create a new user account with email, password, and Solana wallet address.

**Endpoint:** `POST /v1/auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "walletAddress": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
}
```

**Validation Rules:**
- `email`: Valid email format, required
- `password`: Minimum 8 characters, required
- `walletAddress`: Valid Stacks address (starts with 'S', 38-40 alphanumeric characters), required

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "walletAddress": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      "createdAt": "2026-02-09T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

400 - User Already Exists:
```json
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "User with this email or wallet address already exists"
  }
}
```

400 - Validation Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password must be at least 8 characters"
  }
}
```

**Frontend Implementation Example:**
```javascript
async function registerUser(email, password, walletAddress) {
  try {
    const response = await fetch('http://localhost:4000/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, walletAddress })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token in localStorage or secure storage
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

---

### 1.2 Login User

Authenticate an existing user and receive a JWT token.

**Endpoint:** `POST /v1/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "walletAddress": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
}
```

**Validation Rules:**
- `email`: Valid email format, required
- `password`: Required
- `walletAddress`: Valid Stacks address, required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "walletAddress": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      "createdAt": "2026-02-09T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

400 - Wallet Not Found:
```json
{
  "success": false,
  "error": {
    "code": "WALLET_NOT_FOUND",
    "message": "Wallet address not found"
  }
}
```

400 - Invalid Credentials:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or wallet address combination"
  }
}
```

400 - Invalid Password:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid password"
  }
}
```

**Frontend Implementation Example:**
```javascript
async function loginUser(email, password, walletAddress) {
  try {
    const response = await fetch('http://localhost:4000/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, walletAddress })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

---

### 1.3 Test Authentication

Verify that the authentication system is working.

**Endpoint:** `GET /v1/auth/test`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Auth router is working!",
  "timestamp": "2026-02-09T10:30:00.000Z"
}
```

---


## 2. API Management Endpoints

All API management endpoints require authentication. Include the JWT token in the Authorization header.

### 2.1 Create API Wrapper

Create a new payment-gated API wrapper.

**Endpoint:** `POST /v1/apis`

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Weather API",
  "originalUrl": "https://api.openweathermap.org/data/2.5",
  "pricePerRequest": 0.5,
  "minPrice": 0.1,
  "maxPrice": 10,
  "network": "TESTNET",
  "facilitatorUrl": "https://facilitator.x402.com",
  "stacksAddress": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
}
```

**Field Descriptions:**
- `name`: Human-readable name for your API (1-255 characters)
- `originalUrl`: The base URL of the API you want to wrap
- `pricePerRequest`: Price in STX per API request (must be between minPrice and maxPrice)
- `minPrice`: Minimum allowed price (default: 1, optional)
- `maxPrice`: Maximum allowed price (default: 1000, optional)
- `network`: Blockchain network - either "TESTNET" or "MAINNET"
- `facilitatorUrl`: URL of the x402 payment facilitator service
- `stacksAddress`: Your Stacks wallet address to receive payments (must start with 'S')

**Validation Rules:**
- `name`: Required, 1-255 characters
- `originalUrl`: Required, valid URI format
- `pricePerRequest`: Required, positive number, within minPrice-maxPrice range
- `minPrice`: Optional, positive number, must be ≤ maxPrice
- `maxPrice`: Optional, positive number, must be ≥ minPrice
- `network`: Required, must be "TESTNET" or "MAINNET"
- `facilitatorUrl`: Required, valid URI format
- `stacksAddress`: Required, valid Stacks address format (S + 38-40 alphanumeric chars)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "apiId": "clx9876543210",
    "name": "My Weather API",
    "originalUrl": "https://api.openweathermap.org/data/2.5",
    "wrapperUrl": "http://localhost:4000/w/clx9876543210",
    "pricePerRequest": 0.5,
    "minPrice": 0.1,
    "maxPrice": 10,
    "network": "TESTNET",
    "facilitatorUrl": "https://facilitator.x402.com",
    "stacksAddress": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "isActive": true,
    "createdAt": "2026-02-09T10:30:00.000Z"
  }
}
```

**Error Responses:**

401 - Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User authentication required"
  }
}
```

400 - Validation Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Price per request must be between 0.1 and 10"
  }
}
```

409 - Duplicate Entry:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "An API with this configuration already exists"
  }
}
```

**Frontend Implementation Example:**
```javascript
async function createApi(apiConfig) {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:4000/v1/apis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(apiConfig)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('API created! Wrapper URL:', data.data.wrapperUrl);
      return data.data;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Failed to create API:', error);
    throw error;
  }
}

// Usage
const newApi = await createApi({
  name: "My Weather API",
  originalUrl: "https://api.openweathermap.org/data/2.5",
  pricePerRequest: 0.5,
  minPrice: 0.1,
  maxPrice: 10,
  network: "TESTNET",
  facilitatorUrl: "https://facilitator.x402.com",
  stacksAddress: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
});
```

---

### 2.2 List All APIs

Retrieve all API wrappers created by the authenticated user.

**Endpoint:** `GET /v1/apis`

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "apiId": "clx9876543210",
      "name": "My Weather API",
      "originalUrl": "https://api.openweathermap.org/data/2.5",
      "wrapperUrl": "http://localhost:4000/w/clx9876543210",
      "pricePerRequest": 0.5,
      "minPrice": 0.1,
      "maxPrice": 10,
      "network": "TESTNET",
      "facilitatorUrl": "https://facilitator.x402.com",
      "stacksAddress": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      "isActive": true,
      "createdAt": "2026-02-09T10:30:00.000Z"
    },
    {
      "apiId": "clx1111111111",
      "name": "Currency Exchange API",
      "originalUrl": "https://api.exchangerate.host",
      "wrapperUrl": "http://localhost:4000/w/clx1111111111",
      "pricePerRequest": 0.2,
      "minPrice": 0.1,
      "maxPrice": 5,
      "network": "MAINNET",
      "facilitatorUrl": "https://facilitator.x402.com",
      "stacksAddress": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      "isActive": false,
      "createdAt": "2026-02-08T15:20:00.000Z"
    }
  ]
}
```

**Error Responses:**

401 - Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User authentication required"
  }
}
```

**Frontend Implementation Example:**
```javascript
async function listApis() {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:4000/v1/apis', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data; // Array of APIs
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Failed to list APIs:', error);
    throw error;
  }
}
```

---

### 2.3 Get Single API

Retrieve details of a specific API wrapper by ID.

**Endpoint:** `GET /v1/apis/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: The API ID (e.g., "clx9876543210")

**Request Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "apiId": "clx9876543210",
    "name": "My Weather API",
    "originalUrl": "https://api.openweathermap.org/data/2.5",
    "wrapperUrl": "http://localhost:4000/w/clx9876543210",
    "pricePerRequest": 0.5,
    "minPrice": 0.1,
    "maxPrice": 10,
    "network": "TESTNET",
    "facilitatorUrl": "https://facilitator.x402.com",
    "stacksAddress": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "isActive": true,
    "createdAt": "2026-02-09T10:30:00.000Z"
  }
}
```

**Error Responses:**

401 - Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User authentication required"
  }
}
```

404 - Not Found:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "API not found or you do not have permission to access it"
  }
}
```

**Frontend Implementation Example:**
```javascript
async function getApi(apiId) {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:4000/v1/apis/${apiId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Failed to get API:', error);
    throw error;
  }
}
```

---


### 2.4 Update API Configuration

Update an existing API wrapper's configuration.

**Endpoint:** `PATCH /v1/apis/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: The API ID (e.g., "clx9876543210")

**Request Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body (all fields optional, but at least one required):**
```json
{
  "pricePerRequest": 0.75,
  "minPrice": 0.2,
  "maxPrice": 15,
  "isActive": false,
  "network": "MAINNET",
  "facilitatorUrl": "https://new-facilitator.x402.com",
  "stacksAddress": "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE"
}
```

**Field Descriptions:**
- `pricePerRequest`: New price per request (will be clamped between minPrice and maxPrice)
- `minPrice`: New minimum price
- `maxPrice`: New maximum price
- `isActive`: Enable/disable the API wrapper
- `network`: Change blockchain network
- `facilitatorUrl`: Update facilitator service URL
- `stacksAddress`: Change payment recipient address

**Validation Rules:**
- At least one field must be provided
- If provided, `minPrice` must be ≤ `maxPrice`
- `pricePerRequest` will be automatically clamped to stay within min/max bounds
- `network` must be "TESTNET" or "MAINNET"
- `stacksAddress` must be valid Stacks address format

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "apiId": "clx9876543210",
    "name": "My Weather API",
    "originalUrl": "https://api.openweathermap.org/data/2.5",
    "wrapperUrl": "http://localhost:4000/w/clx9876543210",
    "pricePerRequest": 0.75,
    "minPrice": 0.2,
    "maxPrice": 15,
    "network": "MAINNET",
    "facilitatorUrl": "https://new-facilitator.x402.com",
    "stacksAddress": "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    "isActive": false,
    "createdAt": "2026-02-09T10:30:00.000Z"
  }
}
```

**Error Responses:**

401 - Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User authentication required"
  }
}
```

404 - Not Found:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "API not found or you do not have permission to update it"
  }
}
```

400 - Validation Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "At least one field must be provided for update"
  }
}
```

**Frontend Implementation Example:**
```javascript
async function updateApi(apiId, updates) {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:4000/v1/apis/${apiId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('API updated successfully');
      return data.data;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Failed to update API:', error);
    throw error;
  }
}

// Usage examples
// Disable an API
await updateApi('clx9876543210', { isActive: false });

// Update pricing
await updateApi('clx9876543210', { 
  pricePerRequest: 1.0,
  minPrice: 0.5,
  maxPrice: 20
});

// Change network
await updateApi('clx9876543210', { network: 'MAINNET' });
```

---

### 2.5 Delete API

Permanently delete an API wrapper and all associated data.

**Endpoint:** `DELETE /v1/apis/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: The API ID (e.g., "clx9876543210")

**Request Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "API deleted successfully",
  "data": {
    "apiId": "clx9876543210",
    "name": "My Weather API"
  }
}
```

**Error Responses:**

401 - Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User authentication required"
  }
}
```

404 - Not Found:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "API not found or you do not have permission to delete it"
  }
}
```

**Frontend Implementation Example:**
```javascript
async function deleteApi(apiId) {
  const token = localStorage.getItem('authToken');
  
  // Confirm deletion
  if (!confirm('Are you sure you want to delete this API? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:4000/v1/apis/${apiId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('API deleted:', data.data.name);
      return data.data;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Failed to delete API:', error);
    throw error;
  }
}
```

---

### 2.6 Get API Metrics

Retrieve performance and revenue metrics for a specific API.

**Endpoint:** `GET /v1/apis/:id/metrics`

**Authentication:** Required

**URL Parameters:**
- `id`: The API ID (e.g., "clx9876543210")

**Request Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "apiId": "clx9876543210",
    "apiName": "My Weather API",
    "metrics": {
      "totalRequests": 1523,
      "successfulRequests": 1487,
      "failedRequests": 36,
      "successRate": 97.64,
      "totalRevenue": 761.5
    }
  }
}
```

**Field Descriptions:**
- `totalRequests`: Total number of API requests made
- `successfulRequests`: Number of successful requests (2xx status codes)
- `failedRequests`: Number of failed requests
- `successRate`: Percentage of successful requests (0-100)
- `totalRevenue`: Total revenue earned in STX from successful payments

**Error Responses:**

401 - Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User authentication required"
  }
}
```

404 - Not Found:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "API not found or you do not have permission to access it"
  }
}
```

**Frontend Implementation Example:**
```javascript
async function getApiMetrics(apiId) {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:4000/v1/apis/${apiId}/metrics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const { metrics } = data.data;
      console.log(`Success Rate: ${metrics.successRate}%`);
      console.log(`Total Revenue: ${metrics.totalRevenue} STX`);
      return data.data;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Failed to get metrics:', error);
    throw error;
  }
}
```

---


## 3. Analytics Endpoints

### 3.1 Get API Analytics

Retrieve detailed analytics for an API over a specified time period.

**Endpoint:** `GET /v1/apis/:apiId/analytics`

**Authentication:** Required

**URL Parameters:**
- `apiId`: The API ID (e.g., "clx9876543210")

**Query Parameters:**
- `period`: Time period for analytics (optional, default: "30d")
  - Valid values: "7d", "30d", "90d", "1y"

**Request Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example Request:**
```
GET /v1/apis/clx9876543210/analytics?period=7d
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "requests": {
      "total": 1523,
      "successful": 1487,
      "successRate": "97.6%",
      "avgResponseTime": "245ms"
    },
    "revenue": {
      "total": 761.5,
      "currency": "SOL",
      "paymentCount": 1487
    },
    "customers": {
      "unique": 42
    }
  }
}
```

**Field Descriptions:**

Requests:
- `total`: Total number of API requests in the period
- `successful`: Number of successful requests
- `successRate`: Percentage of successful requests (formatted string)
- `avgResponseTime`: Average response time in milliseconds (formatted string)

Revenue:
- `total`: Total revenue earned in the period
- `currency`: Currency type (SOL for Solana)
- `paymentCount`: Number of successful payments

Customers:
- `unique`: Number of unique payer addresses

**Error Responses:**

401 - Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User authentication required"
  }
}
```

404 - Not Found:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "API not found or access denied"
  }
}
```

**Frontend Implementation Example:**
```javascript
async function getApiAnalytics(apiId, period = '30d') {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(
      `http://localhost:4000/v1/apis/${apiId}/analytics?period=${period}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Failed to get analytics:', error);
    throw error;
  }
}

// Usage with React component
function AnalyticsDashboard({ apiId }) {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('30d');
  
  useEffect(() => {
    getApiAnalytics(apiId, period)
      .then(data => setAnalytics(data))
      .catch(error => console.error(error));
  }, [apiId, period]);
  
  if (!analytics) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Analytics</h2>
      <select value={period} onChange={e => setPeriod(e.target.value)}>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
        <option value="1y">Last year</option>
      </select>
      
      <div>
        <h3>Requests</h3>
        <p>Total: {analytics.requests.total}</p>
        <p>Success Rate: {analytics.requests.successRate}</p>
        <p>Avg Response: {analytics.requests.avgResponseTime}</p>
      </div>
      
      <div>
        <h3>Revenue</h3>
        <p>Total: {analytics.revenue.total} {analytics.revenue.currency}</p>
        <p>Payments: {analytics.revenue.paymentCount}</p>
      </div>
      
      <div>
        <h3>Customers</h3>
        <p>Unique: {analytics.customers.unique}</p>
      </div>
    </div>
  );
}
```

---


## 4. Wrapper Endpoint (Public)

### 4.1 Access Payment-Gated API

The wrapper endpoint is the public-facing endpoint that consumers use to access your payment-gated API. This endpoint handles payment verification and proxies requests to the original API.

**Endpoint:** `ALL /w/:apiId/*`

**Authentication:** Payment-based (x402-stacks protocol)

**URL Structure:**
```
http://localhost:4000/w/{apiId}/{endpoint-path}
```

### How URL Wrapping Works

When you create an API wrapper, you provide the **base URL** of your API. The wrapper then allows access to any endpoint under that base URL by appending the path.

**Example 1: Simple API**
- **Original API Base**: `https://my.app`
- **Original Endpoint**: `https://my.app/premium`
- **API ID**: `clx9876543210`
- **Wrapper Base**: `http://localhost:4000/w/clx9876543210`
- **Wrapped Endpoint**: `http://localhost:4000/w/clx9876543210/premium`

**Example 2: API with Base Path**
- **Original API Base**: `https://api.openweathermap.org/data/2.5`
- **Original Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
- **API ID**: `clx9876543210`
- **Wrapper Base**: `http://localhost:4000/w/clx9876543210`
- **Wrapped Endpoint**: `http://localhost:4000/w/clx9876543210/weather`

**Example 3: Multiple Endpoints**
- **Original API Base**: `https://my.app`
- **Original Endpoints**:
  - `https://my.app/premium`
  - `https://my.app/premium/users`
  - `https://my.app/premium/data`
- **API ID**: `clx9876543210`
- **Wrapped Endpoints**:
  - `http://localhost:4000/w/clx9876543210/premium`
  - `http://localhost:4000/w/clx9876543210/premium/users`
  - `http://localhost:4000/w/clx9876543210/premium/data`

### Path Preservation

The wrapper automatically preserves:
- **Path segments**: `/premium/users/123` → `/w/{apiId}/premium/users/123`
- **Query parameters**: `?q=London&units=metric` → `?q=London&units=metric`
- **HTTP methods**: GET, POST, PUT, PATCH, DELETE, etc.
- **Request body**: For POST/PUT/PATCH requests
- **Most headers**: Except payment-specific headers

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: API Owner Creates Wrapper                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Original API:     https://my.app                              │
│  Endpoints:        /premium, /premium/users, /premium/data     │
│                                                                 │
│  Create Wrapper:                                               │
│  {                                                             │
│    "originalUrl": "https://my.app",  ← Base URL only          │
│    "pricePerRequest": 0.5,                                    │
│    ...                                                         │
│  }                                                             │
│                                                                 │
│  Generated:        http://localhost:4000/w/clx9876543210      │
│                    ↑ Share this base URL with consumers        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Consumer Uses Wrapper                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Wrapper Base:     http://localhost:4000/w/clx9876543210      │
│                                                                 │
│  To access /premium:                                           │
│  → http://localhost:4000/w/clx9876543210/premium              │
│     ↓ Payment verified                                         │
│     ↓ Proxied to: https://my.app/premium                      │
│                                                                 │
│  To access /premium/users:                                     │
│  → http://localhost:4000/w/clx9876543210/premium/users        │
│     ↓ Payment verified                                         │
│     ↓ Proxied to: https://my.app/premium/users                │
│                                                                 │
│  To access /premium/data?filter=active:                        │
│  → http://localhost:4000/w/clx9876543210/premium/data?filter=active │
│     ↓ Payment verified                                         │
│     ↓ Proxied to: https://my.app/premium/data?filter=active   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Points

✅ **DO**: Provide only the base URL when creating the wrapper
```javascript
originalUrl: "https://my.app"  // Correct
```

❌ **DON'T**: Include the full endpoint path in originalUrl
```javascript
originalUrl: "https://my.app/premium"  // Wrong - too specific
```

✅ **DO**: Append endpoint paths to the wrapper URL
```javascript
// Wrapper: http://localhost:4000/w/clx9876543210
// Access:  http://localhost:4000/w/clx9876543210/premium
```

✅ **DO**: Use the same wrapper for multiple endpoints
```javascript
// One wrapper can handle all endpoints under the base URL
const wrapper = "http://localhost:4000/w/clx9876543210";
await fetch(`${wrapper}/premium`);
await fetch(`${wrapper}/premium/users`);
await fetch(`${wrapper}/premium/data`);
```

**Payment Flow:**

1. Consumer makes request to wrapper URL
2. System checks if payment is required (402 Payment Required)
3. Consumer submits payment via x402-stacks protocol
4. System verifies payment on Stacks blockchain
5. Request is proxied to original API
6. Response is returned to consumer

**Request Example (without payment):**
```javascript
// First request - will return 402 Payment Required
const response = await fetch('http://localhost:4000/w/clx9876543210/weather?q=London');
```

**Response (402 Payment Required):**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_REQUIRED",
    "message": "Payment required to access this API",
    "paymentDetails": {
      "amount": 0.5,
      "currency": "STX",
      "recipient": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      "network": "testnet"
    }
  }
}
```

**Request Example (with payment):**
```javascript
// Using x402-stacks client library
import { createPaymentRequest } from 'x402-stacks-client';

const paymentRequest = await createPaymentRequest({
  url: 'http://localhost:4000/w/clx9876543210/weather?q=London',
  amount: 0.5,
  recipient: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  network: 'testnet'
});

// Submit payment and make request
const response = await paymentRequest.execute();
const data = await response.json();
```

**Success Response (200):**
The response will be the proxied response from the original API, with the same status code, headers, and body.

**Error Responses:**

404 - API Not Found:
```json
{
  "success": false,
  "error": {
    "code": "API_NOT_FOUND",
    "message": "API not found"
  }
}
```

403 - API Inactive:
```json
{
  "success": false,
  "error": {
    "code": "API_INACTIVE",
    "message": "This API is currently disabled"
  }
}
```

502 - Proxy Error:
```json
{
  "success": false,
  "error": {
    "code": "PROXY_ERROR",
    "message": "Failed to reach original API"
  }
}
```

**Features:**

1. **Payment Verification**: Automatically verifies Stacks blockchain payments
2. **Request Proxying**: Forwards all HTTP methods (GET, POST, PUT, DELETE, etc.)
3. **Query Parameters**: Preserves all query parameters
4. **Request Body**: Forwards request body for POST/PUT/PATCH requests
5. **Headers**: Forwards most headers (except payment-specific ones)
6. **Duplicate Protection**: Prevents replay attacks using transaction hash uniqueness
7. **Metrics Logging**: Automatically logs request metrics and revenue
8. **Flow Engine**: Triggers automation flows on payment/request events

### Complete Usage Example

```javascript
// Step 1: Create API wrapper (API owner)
const api = await client.createApi({
  name: "My Premium API",
  originalUrl: "https://my.app",  // Base URL only
  pricePerRequest: 0.5,
  network: "TESTNET",
  facilitatorUrl: "https://facilitator.x402.com",
  stacksAddress: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
});

console.log('Wrapper URL:', api.wrapperUrl);
// Output: http://localhost:4000/w/clx9876543210

// Step 2: Share wrapper URL with consumers
// Consumers append their desired endpoint path to the wrapper URL

// Original endpoints:
// - https://my.app/premium
// - https://my.app/premium/users
// - https://my.app/premium/data?filter=active

// Wrapped endpoints:
// - http://localhost:4000/w/clx9876543210/premium
// - http://localhost:4000/w/clx9876543210/premium/users
// - http://localhost:4000/w/clx9876543210/premium/data?filter=active
```

**Frontend Consumer Implementation:**

```javascript
// Simple wrapper client for consumers
class X402Client {
  constructor(wrapperBaseUrl, walletProvider) {
    // wrapperBaseUrl should be: http://localhost:4000/w/{apiId}
    this.wrapperBaseUrl = wrapperBaseUrl;
    this.walletProvider = walletProvider;
  }
  
  async request(endpointPath, options = {}) {
    // Construct full URL: wrapper base + endpoint path
    const url = `${this.wrapperBaseUrl}${endpointPath}`;
    
    console.log('Requesting:', url);
    
    // First attempt - check if payment is required
    let response = await fetch(url, options);
    
    if (response.status === 402) {
      // Payment required
      const paymentInfo = await response.json();
      
      // Process payment via wallet
      const txHash = await this.walletProvider.sendPayment({
        amount: paymentInfo.paymentDetails.amount,
        recipient: paymentInfo.paymentDetails.recipient,
        network: paymentInfo.paymentDetails.network
      });
      
      // Retry request with payment proof
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Payment-Transaction': txHash
        }
      });
    }
    
    return response;
  }
}

// Usage Example 1: Access /premium endpoint
const client = new X402Client(
  'http://localhost:4000/w/clx9876543210',  // Wrapper base URL
  myWalletProvider
);

// Access different endpoints
const premiumResponse = await client.request('/premium');
const usersResponse = await client.request('/premium/users');
const dataResponse = await client.request('/premium/data?filter=active');

// Usage Example 2: Weather API
const weatherClient = new X402Client(
  'http://localhost:4000/w/abc123xyz',
  myWalletProvider
);

const londonWeather = await weatherClient.request('/weather?q=London');
const forecast = await weatherClient.request('/forecast?q=London&days=5');
```

---


## 5. Utility Endpoints

### 5.1 Health Check

Check if the API server is running and healthy.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2026-02-09T10:30:00.000Z"
}
```

**Frontend Implementation Example:**
```javascript
async function checkHealth() {
  try {
    const response = await fetch('http://localhost:4000/health');
    const data = await response.json();
    return data.status === 'OK';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
```

---

### 5.2 API Information

Get basic information about the x402Gate API.

**Endpoint:** `GET /`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "message": "SolStore API v1.0",
  "documentation": "/docs",
  "health": "/health"
}
```

---

## 6. Error Handling

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `USER_EXISTS` | 400 | User already registered |
| `INVALID_CREDENTIALS` | 400 | Login credentials invalid |
| `WALLET_NOT_FOUND` | 400 | Wallet address not found |
| `UNAUTHORIZED` | 401 | Authentication required or token invalid |
| `PAYMENT_REQUIRED` | 402 | Payment required to access resource |
| `API_INACTIVE` | 403 | API wrapper is disabled |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `PROXY_ERROR` | 502 | Failed to reach original API |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Error Response Structure

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional details (only in development mode)"
  }
}
```

### Frontend Error Handling Pattern

```javascript
async function apiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!data.success) {
      // Handle API error
      switch (data.error.code) {
        case 'UNAUTHORIZED':
          // Redirect to login
          window.location.href = '/login';
          break;
        case 'VALIDATION_ERROR':
          // Show validation error to user
          showError(data.error.message);
          break;
        case 'NOT_FOUND':
          // Show not found message
          showError('Resource not found');
          break;
        default:
          // Generic error handling
          showError(data.error.message || 'An error occurred');
      }
      throw new Error(data.error.message);
    }
    
    return data.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

---

## 7. Authentication Flow

### Complete Authentication Implementation

```javascript
class AuthService {
  constructor(baseUrl = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
  }
  
  // Register new user
  async register(email, password, walletAddress) {
    const response = await fetch(`${this.baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, walletAddress })
    });
    
    const data = await response.json();
    
    if (data.success) {
      this.setToken(data.data.token);
      this.setUser(data.data.user);
      return data.data;
    }
    
    throw new Error(data.error.message);
  }
  
  // Login existing user
  async login(email, password, walletAddress) {
    const response = await fetch(`${this.baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, walletAddress })
    });
    
    const data = await response.json();
    
    if (data.success) {
      this.setToken(data.data.token);
      this.setUser(data.data.user);
      return data.data;
    }
    
    throw new Error(data.error.message);
  }
  
  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
  
  // Get current token
  getToken() {
    return localStorage.getItem('authToken');
  }
  
  // Set token
  setToken(token) {
    localStorage.setItem('authToken', token);
  }
  
  // Get current user
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  // Set user
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  // Check if authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
  
  // Get auth headers
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Usage
const auth = new AuthService();

// Register
await auth.register('user@example.com', 'password123', 'SP2J6ZY...');

// Login
await auth.login('user@example.com', 'password123', 'SP2J6ZY...');

// Check if authenticated
if (auth.isAuthenticated()) {
  console.log('User is logged in:', auth.getUser());
}

// Logout
auth.logout();
```

---

## 8. Complete API Client

### Full-Featured API Client Implementation

```javascript
class X402GateClient {
  constructor(baseUrl = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
    this.auth = new AuthService(baseUrl);
  }
  
  // Make authenticated request
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.auth.getAuthHeaders(),
      ...options.headers
    };
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data;
  }
  
  // API Management
  async createApi(config) {
    return this.request('/v1/apis', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }
  
  async listApis() {
    return this.request('/v1/apis');
  }
  
  async getApi(apiId) {
    return this.request(`/v1/apis/${apiId}`);
  }
  
  async updateApi(apiId, updates) {
    return this.request(`/v1/apis/${apiId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }
  
  async deleteApi(apiId) {
    return this.request(`/v1/apis/${apiId}`, {
      method: 'DELETE'
    });
  }
  
  async getApiMetrics(apiId) {
    return this.request(`/v1/apis/${apiId}/metrics`);
  }
  
  // Analytics
  async getAnalytics(apiId, period = '30d') {
    return this.request(`/v1/apis/${apiId}/analytics?period=${period}`);
  }
}

// Usage
const client = new X402GateClient();

// Login
await client.auth.login('user@example.com', 'password123', 'SP2J6ZY...');

// Create API
const api = await client.createApi({
  name: 'My API',
  originalUrl: 'https://api.example.com',
  pricePerRequest: 0.5,
  network: 'TESTNET',
  facilitatorUrl: 'https://facilitator.x402.com',
  stacksAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'
});

// List all APIs
const apis = await client.listApis();

// Get metrics
const metrics = await client.getApiMetrics(api.apiId);

// Get analytics
const analytics = await client.getAnalytics(api.apiId, '7d');

// Update API
await client.updateApi(api.apiId, { pricePerRequest: 0.75 });

// Delete API
await client.deleteApi(api.apiId);
```

---

## 9. React Integration Examples

### React Hooks for API Management

```javascript
import { useState, useEffect } from 'react';

// Custom hook for API list
function useApis() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const client = new X402GateClient();
  
  useEffect(() => {
    loadApis();
  }, []);
  
  async function loadApis() {
    try {
      setLoading(true);
      const data = await client.listApis();
      setApis(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function createApi(config) {
    const newApi = await client.createApi(config);
    setApis([...apis, newApi]);
    return newApi;
  }
  
  async function updateApi(apiId, updates) {
    const updated = await client.updateApi(apiId, updates);
    setApis(apis.map(api => api.apiId === apiId ? updated : api));
    return updated;
  }
  
  async function deleteApi(apiId) {
    await client.deleteApi(apiId);
    setApis(apis.filter(api => api.apiId !== apiId));
  }
  
  return {
    apis,
    loading,
    error,
    createApi,
    updateApi,
    deleteApi,
    refresh: loadApis
  };
}

// Custom hook for single API
function useApi(apiId) {
  const [api, setApi] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const client = new X402GateClient();
  
  useEffect(() => {
    if (apiId) {
      loadApi();
    }
  }, [apiId]);
  
  async function loadApi() {
    try {
      setLoading(true);
      const [apiData, metricsData] = await Promise.all([
        client.getApi(apiId),
        client.getApiMetrics(apiId)
      ]);
      setApi(apiData);
      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  return { api, metrics, loading, error, refresh: loadApi };
}

// Component example
function ApiDashboard() {
  const { apis, loading, error, createApi, deleteApi } = useApis();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>My APIs</h1>
      <button onClick={() => {/* show create form */}}>
        Create New API
      </button>
      
      <div className="api-list">
        {apis.map(api => (
          <div key={api.apiId} className="api-card">
            <h3>{api.name}</h3>
            <p>Price: {api.pricePerRequest} STX</p>
            <p>Status: {api.isActive ? 'Active' : 'Inactive'}</p>
            <p>Wrapper: {api.wrapperUrl}</p>
            <button onClick={() => deleteApi(api.apiId)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 10. TypeScript Definitions

### Type Definitions for Frontend

```typescript
// User types
interface User {
  id: string;
  email: string;
  walletAddress: string;
  createdAt: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

// API types
type Network = 'TESTNET' | 'MAINNET';

interface ApiConfig {
  name: string;
  originalUrl: string;
  pricePerRequest: number;
  minPrice?: number;
  maxPrice?: number;
  network: Network;
  facilitatorUrl: string;
  stacksAddress: string;
}

interface Api extends ApiConfig {
  apiId: string;
  wrapperUrl: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiMetrics {
  apiId: string;
  apiName: string;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: number;
    totalRevenue: number;
  };
}

interface Analytics {
  requests: {
    total: number;
    successful: number;
    successRate: string;
    avgResponseTime: string;
  };
  revenue: {
    total: number;
    currency: string;
    paymentCount: number;
  };
  customers: {
    unique: number;
  };
}

// Response types
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

---

## 11. Best Practices

### Security
1. Always store JWT tokens securely (use httpOnly cookies in production)
2. Never expose tokens in URLs or logs
3. Implement token refresh mechanism for long-lived sessions
4. Validate all user inputs on the frontend before sending
5. Use HTTPS in production

### Performance
1. Cache API list and metrics data with appropriate TTL
2. Implement pagination for large API lists
3. Use debouncing for search/filter operations
4. Lazy load analytics data
5. Implement optimistic UI updates

### Error Handling
1. Always handle network errors gracefully
2. Provide user-friendly error messages
3. Implement retry logic for transient failures
4. Log errors for debugging
5. Show loading states during async operations

### User Experience
1. Show loading indicators for all async operations
2. Provide confirmation dialogs for destructive actions
3. Display success messages after operations
4. Implement form validation with clear error messages
5. Use toast notifications for non-blocking feedback

---

## 12. Rate Limiting

The API implements rate limiting to prevent abuse:
- Window: 15 minutes
- Max requests: 100 per IP address
- Response when exceeded: 429 Too Many Requests

Handle rate limiting in your frontend:
```javascript
async function requestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      // Rate limited, wait and retry
      const retryAfter = response.headers.get('Retry-After') || 60;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      continue;
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}
```

---

## Support

For issues or questions:
- GitHub: [Your repository]
- Documentation: [Your docs site]
- Email: [Your support email]

---

**Last Updated:** February 9, 2026
**API Version:** v1.0
