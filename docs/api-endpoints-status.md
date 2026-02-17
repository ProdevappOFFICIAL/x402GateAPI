# API Endpoints Status Documentation

**Generated:** February 17, 2026  
**API Version:** v1.0  
**Base URL:** `http://localhost:4000`

---

## Table of Contents

1. [Overview](#overview)
2. [Working Endpoints](#working-endpoints)
3. [Non-Working Endpoints](#non-working-endpoints)
4. [Authentication System](#authentication-system)
5. [Validation & Middleware](#validation--middleware)
6. [Known Issues](#known-issues)
7. [Testing Recommendations](#testing-recommendations)

---

## Overview

This document provides a comprehensive analysis of all API endpoints in the x402Gate API system, detailing which endpoints are functional, which have issues, and what needs to be fixed.

### System Architecture

- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT-based with wallet integration
- **Payment System:** x402-stacks (Stacks blockchain)
- **Agent Validation:** Stacks blockchain transaction verification

---

## Working Endpoints

### ✅ Health & Info Endpoints

#### `GET /health`
- **Status:** ✅ WORKING
- **Authentication:** None required
- **Description:** Health check endpoint
- **Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-02-17T12:00:00.000Z"
}
```

#### `GET /`
- **Status:** ✅ WORKING
- **Authentication:** None required
- **Description:** API information and documentation links
- **Response:**
```json
{
  "message": "x402Gate API v1.0",
  "documentation": "/docs",
  "health": "/health"
}
```

---

### ✅ API Management Endpoints

All API management endpoints are mounted at `/v1/apis` and require JWT authentication.

#### `POST /v1/apis`
- **Status:** ✅ WORKING
- **Authentication:** Required (JWT Bearer token)
- **Description:** Create a new API wrapper
- **Validation:** `createApiSchema`
- **Request Body:**
```json
{
  "name": "My API",
  "originalUrl": "https://api.example.com",
  "pricePerRequest": 10,
  "minPrice": 1,
  "maxPrice": 1000,
  "network": "TESTNET",
  "facilitatorUrl": "https://facilitator.example.com",
  "stacksAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
}
```
- **Success Response (201):**
```json
{
  "success": true,
  "data": {
    "apiId": "clx123...",
    "name": "My API",
    "originalUrl": "https://api.example.com",
    "wrapperUrl": "http://localhost:4000/w/clx123...",
    "pricePerRequest": 10,
    "minPrice": 1,
    "maxPrice": 1000,
    "network": "TESTNET",
    "facilitatorUrl": "https://facilitator.example.com",
    "stacksAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "isActive": true,
    "createdAt": "2026-02-17T12:00:00.000Z"
  }
}
```

#### `GET /v1/apis`
- **Status:** ✅ WORKING
- **Authentication:** Required (JWT Bearer token)
- **Description:** List all APIs for authenticated user
- **Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "apiId": "clx123...",
      "name": "My API",
      "originalUrl": "https://api.example.com",
      "wrapperUrl": "http://localhost:4000/w/clx123...",
      "pricePerRequest": 10,
      "minPrice": 1,
      "maxPrice": 1000,
      "network": "TESTNET",
      "facilitatorUrl": "https://facilitator.example.com",
      "stacksAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      "isActive": true,
      "createdAt": "2026-02-17T12:00:00.000Z"
    }
  ]
}
```

#### `GET /v1/apis/:id`
- **Status:** ✅ WORKING
- **Authentication:** Required (JWT Bearer token)
- **Description:** Get single API by ID (ownership verified)
- **Success Response (200):** Same as single API object above
- **Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "API not found or you do not have permission to access it"
  }
}
```

#### `GET /v1/apis/:id/metrics`
- **Status:** ✅ WORKING
- **Authentication:** Required (JWT Bearer token)
- **Description:** Get metrics for an API (ownership verified)
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "apiId": "clx123...",
    "apiName": "My API",
    "metrics": {
      "totalRequests": 150,
      "successfulRequests": 145,
      "failedRequests": 5,
      "successRate": 96.67,
      "totalRevenue": 1450.00
    }
  }
}
```

#### `PATCH /v1/apis/:id`
- **Status:** ✅ WORKING
- **Authentication:** Required (JWT Bearer token)
- **Description:** Update API configuration (ownership verified)
- **Validation:** `updateApiSchema`
- **Features:**
  - Automatic price clamping between minPrice and maxPrice
  - Partial updates (only provided fields are updated)
- **Request Body (all fields optional):**
```json
{
  "pricePerRequest": 15,
  "minPrice": 5,
  "maxPrice": 500,
  "isActive": true,
  "network": "MAINNET",
  "facilitatorUrl": "https://new-facilitator.example.com",
  "stacksAddress": "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
}
```
- **Success Response (200):** Same as single API object

#### `DELETE /v1/apis/:id`
- **Status:** ✅ WORKING
- **Authentication:** Required (JWT Bearer token)
- **Description:** Delete an API (ownership verified, cascade deletes related records)
- **Success Response (200):**
```json
{
  "success": true,
  "message": "API deleted successfully",
  "data": {
    "apiId": "clx123...",
    "name": "My API"
  }
}
```

---

### ✅ Wrapper Endpoint (Payment-Gated Proxy)

#### `ALL /w/:apiId/*`
- **Status:** ✅ WORKING (with dependencies)
- **Authentication:** Agent signature validation + x402-stacks payment
- **Description:** Public endpoint for payment-gated API access
- **Flow:**
  1. Extract apiId from URL
  2. Load API configuration from database
  3. Verify API exists and is active
  4. Validate agent signature against Stacks blockchain
  5. Verify x402-stacks payment
  6. Log payment (with duplicate protection)
  7. Proxy request to original API
  8. Log request metrics
  9. Return proxied response

- **Required Headers:**
```
x-agent-wallet: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
x-agent-signature: <signature>
x-agent-timestamp: 1708171200000
x-validator-txid: <stacks-transaction-id>
payment-signature: <x402-payment-signature>
```

- **Success:** Returns proxied response from original API
- **Error Responses:**
  - 404: API not found
  - 403: API inactive or agent not authorized
  - 402: Payment required (from x402-stacks)
  - 502: Failed to reach original API

---

## Non-Working Endpoints

### ❌ Authentication Endpoints

#### `POST /auth/register`
- **Status:** ❌ NOT WORKING - Route not mounted
- **Issue:** Auth router exists but is NOT mounted in `src/index.ts`
- **Expected Route:** `/auth/register`
- **Implementation:** Complete in `src/routers/auth.ts`
- **Fix Required:** Add to `src/index.ts`:
```typescript
import authRoutes from "./routers/auth";
app.use("/auth", authRoutes);
```

#### `POST /auth/login`
- **Status:** ❌ NOT WORKING - Route not mounted
- **Issue:** Auth router exists but is NOT mounted in `src/index.ts`
- **Expected Route:** `/auth/login`
- **Implementation:** Complete in `src/routers/auth.ts`
- **Fix Required:** Add to `src/index.ts`:
```typescript
import authRoutes from "./routers/auth";
app.use("/auth", authRoutes);
```

---

### ⚠️ Analytics Endpoints

#### `GET /analytics/:apiId/analytics`
- **Status:** ⚠️ PARTIALLY WORKING - Route not mounted
- **Issue:** Analytics router exists but is NOT mounted in `src/index.ts`
- **Expected Route:** `/analytics/:apiId/analytics` (or `/v1/analytics/:apiId/analytics`)
- **Implementation:** Complete in `src/routers/analytics.ts`
- **Fix Required:** Add to `src/index.ts`:
```typescript
import analyticsRoutes from "./routers/analytics";
app.use("/v1/analytics", analyticsRoutes);
```

---

## Authentication System

### JWT Authentication

**Middleware:** `authenticateToken` in `src/middleware/auth.ts`

**How it works:**
1. Extracts Bearer token from `Authorization` header
2. Verifies token using JWT secret
3. Checks if user exists in database
4. Verifies user has wallet address
5. Attaches user info to `req.user`

**Usage:**
```typescript
Authorization: Bearer <jwt-token>
```

**Protected Routes:**
- All `/v1/apis/*` endpoints

### Wallet Authentication

**Middleware:** `authenticateWallet` in `src/middleware/auth.ts`

**Status:** ⚠️ Implemented but not used anywhere

**How it works:**
1. Extracts wallet address and signature from headers
2. Verifies wallet exists in database
3. Note: Signature verification is placeholder (not implemented)

---

## Validation & Middleware

### Request Validation

**Middleware:** `validate()` in `src/middleware/validation.ts`

**Schemas:**
- `createApiSchema` - Validates API creation
- `updateApiSchema` - Validates API updates
- `registerSchema` - Validates user registration (not used - route not mounted)
- `loginSchema` - Validates user login (not used - route not mounted)

**Features:**
- Joi-based validation
- Returns all errors (not just first)
- Strips unknown fields
- Type conversion

### Agent Validation

**Middleware:** `validateAgentSignature` in `src/middleware/agentValidator.ts`

**Status:** ✅ WORKING

**Flow:**
1. Extracts agent headers (wallet, signature, timestamp, txid)
2. Fetches transaction data from Stacks API
3. Validates agent wallet against allowed agents list
4. Recreates canonical message
5. Verifies signature using Stacks SDK

**Required Headers:**
```
x-agent-wallet: <stacks-address>
x-agent-signature: <signature>
x-agent-timestamp: <unix-timestamp>
x-validator-txid: <stacks-tx-id>
```

---

## Known Issues

### Critical Issues

1. **Auth Routes Not Mounted**
   - **Impact:** Cannot register or login users
   - **Severity:** HIGH
   - **Fix:** Mount auth router in `src/index.ts`
   - **Affected Endpoints:**
     - `POST /auth/register`
     - `POST /auth/login`

2. **Analytics Routes Not Mounted**
   - **Impact:** Cannot access analytics data
   - **Severity:** MEDIUM
   - **Fix:** Mount analytics router in `src/index.ts`
   - **Affected Endpoints:**
     - `GET /analytics/:apiId/analytics`

### Minor Issues

3. **Unused Parameter in Wrapper Handler**
   - **Location:** `src/handlers/wrapperHandler.ts`
   - **Issue:** `next` parameter declared but never used
   - **Severity:** LOW
   - **Fix:** Remove parameter or use for error handling

4. **Wallet Signature Verification Not Implemented**
   - **Location:** `src/middleware/auth.ts` - `authenticateWallet`
   - **Issue:** Comment says "In a real implementation, you would verify the Solana signature here"
   - **Severity:** MEDIUM (if wallet auth is used)
   - **Note:** Currently not used anywhere

5. **Rate Limiting Disabled**
   - **Location:** `src/index.ts`
   - **Issue:** Rate limiting code is commented out
   - **Severity:** MEDIUM
   - **Impact:** No protection against abuse

### Dependencies

6. **x402-stacks Package Required**
   - **Package:** `x402-stacks@^2.0.1`
   - **Status:** Listed in package.json
   - **Impact:** Wrapper endpoint will fail if not installed
   - **Error:** "Payment system not configured"

7. **Stacks Network Configuration**
   - **Environment Variable:** `STACKS_NETWORK`
   - **Default:** `testnet`
   - **Values:** `testnet` | `mainnet`
   - **Impact:** Agent validation uses wrong network if not set

---

## Testing Recommendations

### 1. Fix Critical Issues First

```bash
# Add to src/index.ts after line 26:
import authRoutes from "./routers/auth";
import analyticsRoutes from "./routers/analytics";

# Add after line 30:
app.use("/auth", authRoutes);
app.use("/v1/analytics", analyticsRoutes);
```

### 2. Test Authentication Flow

```bash
# Register user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "walletAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  }'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "walletAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  }'
```

### 3. Test API Management

```bash
# Create API (use token from login)
curl -X POST http://localhost:4000/v1/apis \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test API",
    "originalUrl": "https://api.example.com",
    "pricePerRequest": 10,
    "network": "TESTNET",
    "facilitatorUrl": "https://facilitator.example.com",
    "stacksAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  }'

# List APIs
curl -X GET http://localhost:4000/v1/apis \
  -H "Authorization: Bearer <token>"

# Get metrics
curl -X GET http://localhost:4000/v1/apis/<apiId>/metrics \
  -H "Authorization: Bearer <token>"
```

### 4. Test Wrapper Endpoint

```bash
# Note: Requires valid agent signature and payment
curl -X GET http://localhost:4000/w/<apiId>/endpoint \
  -H "x-agent-wallet: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" \
  -H "x-agent-signature: <signature>" \
  -H "x-agent-timestamp: 1708171200000" \
  -H "x-validator-txid: <tx-id>" \
  -H "payment-signature: <payment-sig>"
```

### 5. Test Analytics

```bash
# Get analytics (after mounting route)
curl -X GET http://localhost:4000/v1/analytics/<apiId>/analytics?period=30d \
  -H "Authorization: Bearer <token>"
```

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=4000
BASE_URL=http://localhost:4000
NODE_ENV=development

# Stacks Network
STACKS_NETWORK=testnet
```

---

## Summary

### Working (7 endpoints)
- ✅ `GET /health`
- ✅ `GET /`
- ✅ `POST /v1/apis`
- ✅ `GET /v1/apis`
- ✅ `GET /v1/apis/:id`
- ✅ `GET /v1/apis/:id/metrics`
- ✅ `PATCH /v1/apis/:id`
- ✅ `DELETE /v1/apis/:id`
- ✅ `ALL /w/:apiId/*` (with dependencies)

### Not Working (3 endpoints)
- ❌ `POST /auth/register` - Route not mounted
- ❌ `POST /auth/login` - Route not mounted
- ❌ `GET /analytics/:apiId/analytics` - Route not mounted

### Quick Fix

Add these 3 lines to `src/index.ts` to enable all endpoints:

```typescript
import authRoutes from "./routers/auth";
import analyticsRoutes from "./routers/analytics";

app.use("/auth", authRoutes);
app.use("/v1/analytics", analyticsRoutes);
```

---

**Last Updated:** February 17, 2026
