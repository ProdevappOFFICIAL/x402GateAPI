/**
 * Example Agent Client
 * 
 * Demonstrates how to make authenticated requests to the wrapper API
 * with agent signature validation
 */

import axios from 'axios';
import { createHash } from 'crypto';
import { signMessageHashRsv } from '@stacks/encryption';

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const API_ID = 'your-api-id';
const VALIDATOR_TX_ID = '0xa4380d893019185efc652d52be08610bdc9fc0467a4d03347d0fcaeafdf76b2e';

// Your Stacks credentials (NEVER commit these to version control!)
const AGENT_WALLET = 'ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2';
const AGENT_PRIVATE_KEY = 'your-private-key-here';

/**
 * Create SHA256 hash of data
 */
function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Create canonical message for signature
 */
function createCanonicalMessage(
  apiId: string,
  timestamp: number,
  body: any
): string {
  const bodyHash = sha256(JSON.stringify(body));
  return `${apiId}|${timestamp}|${timestamp}|${bodyHash}`;
}

/**
 * Sign a message using Stacks private key
 */
function signMessage(message: string, privateKey: string): string {
  return signMessageHashRsv({
    message,
    privateKey
  });
}

/**
 * Make an authenticated request to the wrapper API
 */
async function makeAuthenticatedRequest(
  apiId: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any
) {
  try {
    console.log(`\n🚀 Making ${method} request to /w/${apiId}${endpoint}`);
    
    // Generate timestamp
    const timestamp = Date.now();
    console.log(`⏰ Timestamp: ${timestamp}`);
    
    // Create canonical message
    const message = createCanonicalMessage(apiId, timestamp, body || {});
    console.log(`📝 Canonical message: ${message}`);
    
    // Sign message
    const signature = signMessage(message, AGENT_PRIVATE_KEY);
    console.log(`✍️ Signature created: ${signature.substring(0, 20)}...`);
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'x-agent-wallet': AGENT_WALLET,
      'x-agent-signature': signature,
      'x-agent-timestamp': timestamp.toString(),
      'x-validator-txid': VALIDATOR_TX_ID
    };
    
    console.log(`📋 Headers prepared:`, {
      'x-agent-wallet': AGENT_WALLET,
      'x-agent-timestamp': timestamp,
      'x-validator-txid': VALIDATOR_TX_ID.substring(0, 20) + '...'
    });
    
    // Make request
    const response = await axios({
      method,
      url: `${API_BASE_URL}/w/${apiId}${endpoint}`,
      headers,
      data: body,
      validateStatus: () => true // Accept any status code
    });
    
    console.log(`\n✅ Response received:`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Data:`, JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error: any) {
    console.error(`\n❌ Request failed:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    throw error;
  }
}

/**
 * Example usage
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Agent Client Example - Authenticated Wrapper API Requests');
  console.log('='.repeat(60));
  
  try {
    // Example 1: GET request
    console.log('\n📌 Example 1: GET Request');
    await makeAuthenticatedRequest(
      API_ID,
      '/users',
      'GET'
    );
    
    // Example 2: POST request with body
    console.log('\n📌 Example 2: POST Request with Body');
    await makeAuthenticatedRequest(
      API_ID,
      '/users',
      'POST',
      {
        name: 'John Doe',
        email: 'john@example.com'
      }
    );
    
    // Example 3: PUT request
    console.log('\n📌 Example 3: PUT Request');
    await makeAuthenticatedRequest(
      API_ID,
      '/users/123',
      'PUT',
      {
        name: 'Jane Doe'
      }
    );
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All examples completed successfully!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Examples failed:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

// Export functions for use in other modules
export {
  sha256,
  createCanonicalMessage,
  signMessage,
  makeAuthenticatedRequest
};
