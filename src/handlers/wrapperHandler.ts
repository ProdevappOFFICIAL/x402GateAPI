import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import prisma from '../configs/database';

/**
 * Wrapper Handler - Public endpoint for payment-gated API access
 * Route: /w/:apiId/*
 * 
 * Flow:
 * 1. Extract apiId from URL
 * 2. Load API configuration
 * 3. Verify API exists and is active
 * 4. Apply x402-stacks payment middleware
 * 5. Log payment (with duplicate protection)
 * 6. Proxy request to original API
 * 7. Log request metrics
 * 8. Trigger flow engine
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1-6.5, 7.1-7.5, 9.1-9.5
 */

export async function handleWrapper(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  try {
    // ============================================
    // SUBTASK 4.1: Extract apiId and load config
    // ============================================
    
    // Extract apiId from URL path (/w/:apiId/*)
    const pathParts = req.path.split('/');
    const apiId = pathParts[2]; // /w/:apiId/*
    
    if (!apiId) {
      console.error('❌ Invalid wrapper URL format - missing apiId');
      return res.status(404).json({
        success: false,
        error: {
          code: 'API_NOT_FOUND',
          message: 'Invalid wrapper URL format'
        }
      });
    }
    
    console.log(`🔗 Wrapper request: ${req.method} /w/${apiId}${req.path.replace(`/w/${apiId}`, '')}`);
    
    // Load API configuration from database
    const api = await prisma.api.findUnique({
      where: { id: apiId }
    });
    
    // Check if API exists
    if (!api) {
      console.error(`❌ API not found: ${apiId}`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'API_NOT_FOUND',
          message: 'API not found'
        }
      });
    }
    
    // Check if API is active
    if (!api.isActive) {
      console.warn(`⚠️ API is inactive: ${api.name} (${apiId})`);
      return res.status(403).json({
        success: false,
        error: {
          code: 'API_INACTIVE',
          message: 'This API is currently disabled'
        }
      });
    }
    
    console.log(`✅ API found: ${api.name} (${apiId}) - Price: ${api.pricePerRequest} STX`);
    
    // ============================================
    // SUBTASK 4.2: x402-stacks payment middleware
    // ============================================
    
    // Import x402-stacks dynamically
    let paymentMiddleware: any;
    let getPayment: any;
    let STXtoMicroSTX: any;
    
    try {
      const x402 = await import('x402-stacks');
      paymentMiddleware = x402.paymentMiddleware;
      getPayment = x402.getPayment;
      STXtoMicroSTX = x402.STXtoMicroSTX;
    } catch (error: any) {
      console.error('❌ x402-stacks package not installed:', error.message);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Payment system not configured'
        }
      });
    }
    
    console.log(`💳 Verifying payment: ${api.pricePerRequest} STX to ${api.stacksAddress} on ${api.network}`);
    
    // Apply payment middleware dynamically
    const middleware = paymentMiddleware({
      amount: STXtoMicroSTX(api.pricePerRequest),
      payTo: api.stacksAddress,
      network: api.network.toLowerCase() as 'testnet' | 'mainnet',
      facilitatorUrl: api.facilitatorUrl
    });
    
    // Execute payment middleware
    try {
      await new Promise<void>((resolve, reject) => {
        middleware(req, res, (err?: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (paymentError: any) {
      console.error('❌ Payment verification failed:', paymentError.message);
      // Payment middleware already sent 402 response, just return
      return;
    }
    
    // If we reach here, payment was verified successfully
    const payment = getPayment(req);
    console.log(`✅ Payment verified: ${payment.transaction} from ${payment.payer}`);
    
    // ============================================
    // SUBTASK 4.3: Payment logging with duplicate protection
    // ============================================
    
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
      console.log(`💰 Payment logged: ${payment.transaction} - ${api.pricePerRequest} STX`);
    } catch (error: any) {
      // Gracefully handle duplicate transaction hash (P2002 = unique constraint violation)
      if (error.code === 'P2002') {
        console.log('⚠️ Duplicate payment transaction detected, skipping insert (replay protection)');
      } else {
        console.error('❌ Failed to log payment:', error.message);
        // Don't fail the request, just log the error
      }
    }
    
    // ============================================
    // SUBTASK 4.4: Proxy request to original API
    // ============================================
    
    // Strip /w/:apiId from path and preserve remaining path
    const cleanPath = req.path.replace(`/w/${apiId}`, '') || '/';
    const targetUrl = api.originalUrl + cleanPath;
    
    console.log(`🔄 Proxying ${req.method} request to: ${targetUrl}${Object.keys(req.query).length > 0 ? '?' + new URLSearchParams(req.query as any).toString() : ''}`);
    
    try {
      // Forward request to original API
      const proxyResponse = await axios({
        method: req.method,
        url: targetUrl,
        params: req.query,
        headers: {
          ...req.headers,
          host: new URL(api.originalUrl).host,
          // Remove x402 headers to avoid confusion
          'payment-signature': undefined,
          'payment-required': undefined,
          'payment-response': undefined
        },
        data: req.body,
        timeout: 30000, // 30 seconds
        validateStatus: () => true // Accept any status code
      });
      
      const responseMs = Date.now() - startTime;
      const success = proxyResponse.status >= 200 && proxyResponse.status < 300;
      
      console.log(`${success ? '✅' : '⚠️'} Proxy response: ${proxyResponse.status} ${proxyResponse.statusText} (${responseMs}ms)`);
      
      // ============================================
      // SUBTASK 4.5: Request logging (async)
      // ============================================
      
      // Log asynchronously to avoid blocking response
      prisma.apiRequest.create({
        data: {
          apiId,
          success,
          responseMs
        }
      }).then(() => {
        console.log(`📊 Request logged: ${success ? 'SUCCESS' : 'FAILED'} (${responseMs}ms)`);
      }).catch(error => {
        console.error('❌ Failed to log API request:', error.message);
      });
      
      // ============================================
      // SUBTASK 4.6: Trigger flow engine
      // ============================================
      
      // Import and trigger flow engine (async, non-blocking)
      import('../services/flowEngine').then(({ triggerFlowEngine }) => {
        triggerFlowEngine({
          apiId,
          events: ['PAYMENT_SUCCESS', 'API_REQUEST'],
          context: {
            payment: {
              amount: api.pricePerRequest,
              payer: payment.payer
            },
            request: {
              success,
              responseMs
            }
          }
        }).then(() => {
          console.log(`⚙️ Flow engine triggered for API: ${api.name}`);
        }).catch(error => {
          console.error('❌ Flow engine error:', error.message);
        });
      }).catch(error => {
        console.error('❌ Failed to load flow engine:', error.message);
      });
      
      // Return proxied response
      res.status(proxyResponse.status)
        .set(proxyResponse.headers)
        .send(proxyResponse.data);
        
    } catch (error: any) {
      const responseMs = Date.now() - startTime;
      
      // Determine error type and log appropriately
      if (error.code === 'ECONNREFUSED') {
        console.error(`❌ PROXY_ERROR: Connection refused to ${api.originalUrl} - Original API is unreachable`);
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        console.error(`❌ PROXY_ERROR: Timeout connecting to ${api.originalUrl} - Request exceeded 30s timeout`);
      } else if (error.code === 'ENOTFOUND') {
        console.error(`❌ PROXY_ERROR: DNS lookup failed for ${api.originalUrl} - Domain not found`);
      } else {
        console.error(`❌ PROXY_ERROR: Failed to proxy request to ${api.originalUrl}:`, error.message);
      }
      
      // Log failed request
      prisma.apiRequest.create({
        data: {
          apiId,
          success: false,
          responseMs
        }
      }).then(() => {
        console.log(`📊 Failed request logged (${responseMs}ms)`);
      }).catch(err => {
        console.error('❌ Failed to log failed request:', err.message);
      });
      
      return res.status(502).json({
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to reach original API',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
    
  } catch (error: any) {
    console.error('❌ Wrapper handler unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
    
    // If error is from payment middleware (402), let it pass through
    if (res.headersSent) {
      console.log('⚠️ Response already sent, skipping error handler');
      return;
    }
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
}
