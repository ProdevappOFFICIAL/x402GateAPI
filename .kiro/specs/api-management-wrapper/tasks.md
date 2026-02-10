# Implementation Plan

- [x] 1. Set up validation schemas and middleware





  - Create Joi validation schemas for API creation and updates in `src/middleware/schemas.ts`
  - Include minPrice and maxPrice fields with defaults (1 and 1000)
  - Add validation middleware if not already present in `src/middleware/validation.ts`
  - _Requirements: 1.1, 1.4, 1.5, 3.1, 3.2, 3.3_

- [x] 2. Implement API controller with CRUD operations





  - [x] 2.1 Create API controller file with createApi function


    - Implement wrapper URL generation using cuid
    - Validate original URL format
    - Store API configuration in database with minPrice and maxPrice defaults
    - Return API record with wrapper URL
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 2.2 Implement listApis and getApi functions


    - Filter APIs by authenticated user ID
    - Return complete API configurations
    - Handle not found and ownership errors
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 2.3 Implement updateApi function


    - Allow updates to price, isActive, network, facilitatorUrl, stacksAddress, minPrice, maxPrice
    - Clamp pricePerRequest between minPrice and maxPrice when updating
    - Prevent modification of wrapperUrl and originalUrl
    - Verify ownership before update
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 2.4 Implement deleteApi function


    - Verify ownership before deletion
    - Remove API record from database
    - Return appropriate success/error responses
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 2.5 Implement getApiMetrics function


    - Calculate total request count from ApiRequest table
    - Calculate success rate from successful vs total requests
    - Calculate total revenue from successful Payment records
    - Handle zero-request edge case
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3. Create API management router





  - Set up Express router with authentication middleware
  - Mount CRUD endpoints (POST /, GET /, GET /:id, PATCH /:id, DELETE /:id)
  - Add metrics endpoint (GET /:id/metrics)
  - Apply validation middleware to POST and PATCH routes
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1_

- [x] 4. Implement wrapper handler with x402-stacks integration






  - [x] 4.1 Create wrapper handler with request routing

    - Extract apiId from URL path
    - Load API configuration from database
    - Check if API exists and is active
    - Handle any HTTP method (GET, POST, PUT, DELETE, PATCH)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 4.2 Integrate x402-stacks payment middleware

    - Import paymentMiddleware, getPayment, STXtoMicroSTX from x402-stacks
    - Apply paymentMiddleware dynamically with API config (amount, payTo, network, facilitatorUrl)
    - Extract payment details using getPayment(req) after verification
    - Handle 402 responses automatically via middleware
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 4.3 Add payment logging with duplicate protection

    - Create Payment record with transaction hash from getPayment(req)
    - Store payer address and amount
    - Set status to SUCCESS for verified payments
    - Gracefully handle duplicate txHash (P2002 error) to prevent crashes
    - Link payment to API record
    - _Requirements: 7.5, 6.4, 6.5_
  

  - [x] 4.4 Implement request proxying to original API





    - Strip /w/:apiId from path and preserve remaining path
    - Construct target URL: originalUrl + cleanPath
    - Forward request method, headers, body, and query parameters
    - Set appropriate timeout (30 seconds)
    - Handle proxy errors and return 502 on failure
    - _Requirements: 5.5, 9.5_

  
  - [x] 4.5 Add request logging





    - Create ApiRequest record with timestamp and response time
    - Set success field based on response status code (200-299 = success)
    - Log asynchronously to avoid blocking proxy

    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 4.6 Trigger automation flow engine (CRITICAL)








    - After successful payment, emit PAYMENT_SUCCESS event
    - After request completion, emit API_REQUEST event
    - Call triggerFlowEngine with apiId and event context
    - Pass payment and request metrics to flow engine
    - Execute inline (synchronous for MVP)
    - _Requirements: Flow automation integration_

- [x] 5. Implement flow engine service (MVP)





  - Create flow engine service in `src/services/flowEngine.ts`
  - Implement triggerFlowEngine function with event interface
  - Load enabled flows for the API from database
  - Filter flows by trigger type (PAYMENT_SUCCESS, API_REQUEST)
  - Execute flow nodes and apply actions (e.g., price updates)
  - Implement price clamping with minPrice/maxPrice safety bounds
  - Add console logging for flow execution debugging
  - _Requirements: Flow automation, price safety_

- [x] 6. Integrate routes into main server





  - Import API router and wrapper handler in `src/index.ts`
  - Mount API router at `/v1/apis`
  - Mount wrapper handler at `/w/:apiId/*`
  - Ensure wrapper handler is before error handler middleware
  - _Requirements: 1.1, 5.1_

- [x] 7. Add error handling and logging





  - Implement wrapper-specific error codes (API_NOT_FOUND, API_INACTIVE, PROXY_ERROR)
  - Add console logging for payment verification attempts
  - Log proxy errors when original API is unreachable
  - Ensure consistent error response format across all endpoints
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 8. Update database schema (optional but recommended)





  - Add minPrice and maxPrice fields to Api model in schema.prisma
  - Set defaults: minPrice = 1, maxPrice = 1000
  - Run database migration: `npm run db:migrate`
  - _Requirements: Price safety bounds_

- [x] 9. Environment configuration and dependencies





  - Install x402-stacks package: `npm install x402-stacks`
  - Add BASE_URL environment variable for wrapper URL generation
  - Add NETWORK environment variable (testnet/mainnet)
  - Add FACILITATOR_URL environment variable (default: https://facilitator.stacksx402.com)
  - Update .env file with new variables
  - _Requirements: 1.3_

- [ ]* 10. Testing and validation
  - [ ]* 10.1 Write integration tests for API CRUD operations
    - Test API creation with valid data
    - Test listing APIs filtered by user
    - Test updating API price and settings
    - Test deleting API with ownership validation
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  
  - [ ]* 10.2 Write integration tests for wrapper handler
    - Test wrapper returns 402 without payment
    - Test wrapper proxies request with valid payment
    - Test wrapper returns 403 for inactive API
    - Test wrapper returns 404 for non-existent API
    - _Requirements: 5.1, 5.2, 5.3, 6.1_
  
  - [ ]* 10.3 Write integration tests for metrics calculation
    - Test metrics with zero requests
    - Test success rate calculation
    - Test revenue calculation from payments
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
