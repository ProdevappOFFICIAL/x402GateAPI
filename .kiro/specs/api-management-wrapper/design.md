# Design Document

## Overview

This design implements the core monetization engine of x402 Fabric: API management with payment-gated wrapper endpoints. The system consists of two main components: (1) authenticated API management routes for CRUD operations on API configurations, and (2) a public wrapper handler that intercepts requests, verifies x402 payments via Stacks blockchain, and proxies to original APIs. The design follows the existing Express.js architecture with Prisma ORM, JWT authentication, and standardized error handling.

## Architecture

### High-Level Flow

```
API Owner → Dashboard → POST /v1/apis (authenticated)
                              ↓
                        Generate wrapper URL
                              ↓
API Consumer → GET /w/{apiId}/endpoint (public)
                              ↓
                        Verify x402 payment
                              ↓
                        Log request + payment
                              ↓
                        Proxy to original API
                              ↓
                        Return response
```

### Component Layers

1. **Router Layer** (`src/routers/apis.ts`)
   - Handles HTTP routing for `/v1/apis/*` endpoints
   - Applies authentication middleware
   - Validates request bodies with Joi schemas
   - Delegates to controller functions

2. **Controller Layer** (`src/controllers/apiController.ts`)
   - Business logic for API CRUD operations
   - Wrapper URL generation
   - Metrics calculation
   - Error handling and response formatting

3. **Wrapper Handler** (`src/handlers/wrapperHandler.ts`)
   - Public endpoint handler for `/w/:apiId/*`
   - Payment verification integration
   - Request proxying with axios
   - Logging and analytics

4. **Payment Service** (`src/services/paymentService.ts`)
   - x402 payment verification logic
   - Stacks blockchain integration
   - Payment record creation

5. **Validation Layer** (`src/middleware/schemas.ts`)
   - Joi schemas for request validation
   - Reusable validation patterns

## Components and Interfaces

### 1. API Router (`src/routers/apis.ts`)

```typescript
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as apiController from '../controllers/apiController';
import { createApiSchema, updateApiSchema } from '../middleware/schemas';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', validate(createApiSchema), apiController.createApi);
router.get('/', apiController.listApis);
router.get('/:id', apiController.getApi);
router.get('/:id/metrics', apiController.getApiMetrics);
router.patch('/:id', validate(updateApiSchema), apiController.updateApi);
router.delete('/:id', apiController.deleteApi);

export default router;
```

### 2. API Controller (`src/controllers/apiController.ts`)

**Key Functions:**

- `createApi(req, res, next)`: Creates API record, generates wrapper URL
- `listApis(req, res, next)`: Returns all APIs for authenticated user
- `getApi(req, res, next)`: Returns single API with ownership check
- `getApiMetrics(req, res, next)`: Calculates request count, success rate, revenue
- `updateApi(req, res, next)`: Updates mutable fields (price, isActive, network, etc.)
- `deleteApi(req, res, next)`: Soft or hard delete with ownership verification

**Wrapper URL Generation:**
```typescript
const apiId = cuid();
const wrapperUrl = `${process.env.BASE_URL || 'http://localhost:4000'}/w/${apiId}`;
```

**Response Format:**
```typescript
{
  success: true,
  data: {
    apiId: string,
    name: string,
    originalUrl: string,
    wrapperUrl: string,
    pricePerRequest: number,
    network: 'TESTNET' | 'MAINNET',
    facilitatorUrl: string,
    stacksAddress: string,
    isActive: boolean,
    createdAt: string
  }
}
```

### 3. Wrapper Handler (`src/handlers/wrapperHandler.ts`)

**Request Flow:**

1. Extract `apiId` from URL path
2. Load API configuration from database
3. Check if API is active
4. Apply `paymentMiddleware` from x402-stacks with API config
5. If payment valid, `getPayment(req)` extracts payment details
6. Log payment record with transaction hash and payer (with duplicate protection)
7. Proxy request to original API (preserving full path and query)
8. Log API request record with response time and success status
9. **Trigger flow engine** with PAYMENT_SUCCESS and API_REQUEST events
10. Return response to consumer

**Using x402-stacks Middleware:**
```typescript
import { paymentMiddleware, getPayment, STXtoMicroSTX } from 'x402-stacks';

// Apply payment middleware dynamically based on API config
const middleware = paymentMiddleware({
  amount: STXtoMicroSTX(api.pricePerRequest),
  payTo: api.stacksAddress,
  network: api.network.toLowerCase() as 'testnet' | 'mainnet',
  facilitatorUrl: api.facilitatorUrl
});

// After payment verification succeeds
const payment = getPayment(req);
// payment.transaction, payment.payer, payment.network
```

**Proxying Logic:**
```typescript
// Strip /w/:apiId from path and preserve everything else
const cleanPath = req.path.replace(`/w/${apiId}`, '') || '/';
const targetUrl = api.originalUrl + cleanPath;

const response = await axios({
  method: req.method,
  url: targetUrl,
  params: req.query,  // Preserves query parameters
  headers: { ...req.headers, host: new URL(api.originalUrl).host },
  data: req.body,
  timeout: 30000
});
```

**Payment Logging with Duplicate Protection:**
```typescript
try {
  await prisma.payment.create({
    data: {
      apiId,
      amount: api.pricePerRequest,
      txHash: payment.transaction,
      status: 'SUCCESS',
      payerAddress: payment.payer
    }
  });
} catch (error) {
  // Gracefully handle duplicate transaction hash (replay protection)
  if (error.code === 'P2002') {
    console.log('⚠️ Duplicate payment transaction, skipping insert');
  } else {
    throw error;
  }
}
```

**Flow Engine Trigger:**
```typescript
// After successful payment and request completion
await triggerFlowEngine({
  apiId,
  events: ['PAYMENT_SUCCESS', 'API_REQUEST'],
  context: {
    payment: { amount: api.pricePerRequest, payer: payment.payer },
    request: { success: responseSuccess, responseMs }
  }
});
```

### 4. x402-stacks Integration

**Package:** `x402-stacks` (already handles all payment verification)

**Key Functions:**
- `paymentMiddleware(options)`: Express middleware that verifies payments automatically
- `getPayment(req)`: Extracts verified payment details from request
- `STXtoMicroSTX(stx)`: Converts STX to microSTX

**Middleware Options:**
```typescript
{
  amount: number | bigint,        // Payment amount in microSTX
  payTo: string,                  // Recipient Stacks address
  network: 'testnet' | 'mainnet', // Network type
  facilitatorUrl: string,         // Facilitator service URL
  asset?: string,                 // Optional: 'STX', 'sBTC', etc.
  description?: string,           // Optional: Resource description
  maxTimeoutSeconds?: number      // Optional: Payment timeout (default 300)
}
```

**Payment Flow:**
1. Middleware checks for `payment-signature` header
2. If missing, returns 402 with `payment-required` header
3. If present, verifies and settles via facilitator
4. If valid, attaches payment info to request
5. Response includes `payment-response` header

**No custom payment service needed** - x402-stacks handles everything!

### 5. Flow Engine Service (`src/services/flowEngine.ts`)

**Purpose:** Executes automation flows in response to API events (payment success, request completion)

**Interface:**
```typescript
interface FlowEvent {
  apiId: string;
  events: string[];  // ['PAYMENT_SUCCESS', 'API_REQUEST']
  context: {
    payment?: { amount: number; payer: string };
    request?: { success: boolean; responseMs: number };
  };
}

async function triggerFlowEngine(event: FlowEvent): Promise<void>
```

**Implementation Strategy:**

1. Load all enabled flows for the API
2. Filter flows by trigger type (PAYMENT_SUCCESS, API_REQUEST)
3. Execute flow nodes sequentially
4. Apply resulting actions (e.g., price updates with safety bounds)
5. Log flow execution results

**Price Update with Safety Bounds:**
```typescript
// Clamp price between min and max to prevent runaway automation
const clampPrice = (price: number, min: number = 1, max: number = 1000) => {
  return Math.max(min, Math.min(max, price));
};

// When flow suggests new price
const newPrice = clampPrice(suggestedPrice, api.minPrice || 1, api.maxPrice || 1000);
await prisma.api.update({
  where: { id: apiId },
  data: { pricePerRequest: newPrice }
});
```

**MVP Implementation:**
- Synchronous execution (inline, not async queue)
- Simple trigger matching
- Basic action execution (price updates)
- Console logging for debugging

### 6. Validation Schemas (`src/middleware/schemas.ts`)

```typescript
export const createApiSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  originalUrl: Joi.string().uri().required(),
  pricePerRequest: Joi.number().positive().required(),
  minPrice: Joi.number().positive().default(1),
  maxPrice: Joi.number().positive().default(1000),
  network: Joi.string().valid('TESTNET', 'MAINNET').required(),
  facilitatorUrl: Joi.string().uri().required(),
  stacksAddress: Joi.string().required().pattern(/^S[A-Z0-9]{39}$/)
});

export const updateApiSchema = Joi.object({
  pricePerRequest: Joi.number().positive(),
  minPrice: Joi.number().positive(),
  maxPrice: Joi.number().positive(),
  isActive: Joi.boolean(),
  network: Joi.string().valid('TESTNET', 'MAINNET'),
  facilitatorUrl: Joi.string().uri(),
  stacksAddress: Joi.string().pattern(/^S[A-Z0-9]{39}$/)
}).min(1);
```

## Data Models

The Prisma schema already defines all necessary models. Key relationships:

```
User (1) ──→ (N) Api
Api (1) ──→ (N) ApiRequest
Api (1) ──→ (N) Payment
```

**Recommended Schema Enhancement (Optional but Important):**

Add price safety bounds to the Api model to prevent runaway automation:

```prisma
model Api {
  // ... existing fields ...
  pricePerRequest  Float
  minPrice         Float?  @default(1)
  maxPrice         Float?  @default(1000)
  // ... rest of fields ...
}
```

This allows API owners to set guardrails for automated pricing adjustments.

## Error Handling

### Standard Error Response Format

```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Error Codes

**API Management Routes:**
- `UNAUTHORIZED` (401): Missing or invalid JWT
- `VALIDATION_ERROR` (400): Invalid request body
- `NOT_FOUND` (404): API not found or not owned by user
- `DUPLICATE_ENTRY` (409): Wrapper URL collision (unlikely with cuid)
- `INTERNAL_SERVER_ERROR` (500): Database or unexpected errors

**Wrapper Handler:**
- `API_NOT_FOUND` (404): Invalid apiId in wrapper URL
- `API_INACTIVE` (403): API is disabled by owner
- `PAYMENT_REQUIRED` (402): Missing or invalid payment proof
- `PAYMENT_VERIFICATION_FAILED` (402): Payment amount/recipient mismatch
- `PROXY_ERROR` (502): Original API unreachable or error
- `INTERNAL_SERVER_ERROR` (500): Unexpected errors

### Error Logging

Use existing console.error pattern with emoji prefixes:
```typescript
console.error('❌ Payment verification failed:', error);
console.error('❌ Failed to proxy request to original API:', error);
```

## Testing Strategy

### Unit Tests (Optional)

Focus on critical business logic:
- Wrapper URL generation uniqueness
- Metrics calculation accuracy (success rate, revenue)
- Payment verification logic

### Integration Tests

Priority test scenarios:
1. **API Creation Flow**: POST /v1/apis → verify wrapper URL generated
2. **Wrapper Payment Flow**: GET /w/{apiId}/test → verify 402 response
3. **Wrapper with Valid Payment**: GET /w/{apiId}/test with payment headers → verify proxy
4. **Metrics Calculation**: Create requests → verify GET /v1/apis/:id/metrics
5. **Ownership Validation**: User A cannot access User B's APIs

### Manual Testing Checklist

- [ ] Create API via Postman/curl with valid JWT
- [ ] Call wrapper URL without payment → expect 402
- [ ] Call wrapper URL with mock payment → expect proxy to original API
- [ ] Update API price → verify wrapper uses new price
- [ ] Disable API → verify wrapper returns 403
- [ ] Delete API → verify wrapper returns 404
- [ ] Check metrics endpoint for accurate counts

## Security Considerations

1. **Authentication**: All API management routes require valid JWT
2. **Ownership Validation**: Always filter by `userId` from JWT payload
3. **Input Validation**: Joi schemas prevent injection attacks
4. **Rate Limiting**: Wrapper handler should have separate rate limits (future)
5. **Payment Verification**: Must validate on-chain transaction, not trust client
6. **Duplicate Payment Protection**: txHash is unique - gracefully handle replays
7. **Price Safety Bounds**: minPrice/maxPrice prevent runaway automation
8. **CORS**: Wrapper handler needs permissive CORS for public access
9. **Secrets**: Store JWT_SECRET, blockchain keys in environment variables

## Performance Considerations

1. **Database Indexing**: Ensure indexes on `Api.wrapperUrl`, `Api.userId`, `Payment.txHash`
2. **Caching**: Consider caching API configs in memory (future optimization)
3. **Async Logging**: Log requests/payments asynchronously to avoid blocking proxy
4. **Timeout Handling**: Set reasonable timeout (30s) for original API calls
5. **Connection Pooling**: Prisma handles this automatically

## Deployment Notes

1. **Environment Variables**:
   - `BASE_URL`: Public URL for wrapper generation (e.g., `https://api.fabric.xyz`)
   - `JWT_SECRET`: Already configured
   - `DATABASE_URL`: Already configured
   - `NETWORK`: 'testnet' or 'mainnet' for x402-stacks
   - `FACILITATOR_URL`: Default facilitator (e.g., `https://facilitator.stacksx402.com`)

2. **Install x402-stacks**:
   ```bash
   npm install x402-stacks
   ```

3. **Database Migration**:
   ```bash
   npm run db:migrate
   ```

4. **Route Registration** in `src/index.ts`:
   ```typescript
   import apiRoutes from './routers/apis';
   import { handleWrapper } from './handlers/wrapperHandler';
   
   app.use('/v1/apis', apiRoutes);
   app.all('/w/:apiId/*', handleWrapper);
   ```

## Future Enhancements

- Webhook notifications for payment events
- API usage quotas and throttling
- Multi-currency support (BTC, ETH)
- Wrapper analytics dashboard
- API key authentication as alternative to x402
- Batch payment verification for high-volume APIs
