import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { createHash } from 'crypto';
import { verifyMessageSignatureRsv } from '@stacks/encryption';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

/**
 * Agent Validator Middleware
 * 
 * Validates incoming requests against Stacks blockchain registry
 * 
 * Flow:
 * 1. Extract headers: x-agent-wallet, x-agent-signature, x-agent-timestamp, x-validator-txid
 * 2. Fetch transaction data from Stacks API using x-validator-txid
 * 3. Validate agent wallet against allowed-agents from transaction
 * 4. Recreate canonical message and verify signature
 * 5. If valid → continue to x402 payment middleware
 * 6. If invalid → return 403 Access Denied
 */

interface StacksTransaction {
  tx_id: string;
  tx_status: string;
  contract_call?: {
    contract_id: string;
    function_name: string;
    function_args: Array<{
      name: string;
      repr: string;
      hex: string;
      type: string;
    }>;
  };
}

interface StacksApiResponse {
  limit: number;
  offset: number;
  total: number;
  results: StacksTransaction[];
}

interface ApiConfig {
  apiName: string;
  allowedAgents: string;
  cooldownBlocks: number;
  verifyAgent: boolean;
  owner: string;
}

/**
 * Parse Clarity string from hex representation
 */
function parseHexString(hex: string): string {
  // Remove 0x prefix and type prefix (0d for string-ascii, 0e for string-utf8)
  const cleanHex = hex.replace(/^0x0[de]/, '').replace(/^0x/, '');
  
  // Skip length bytes (first 8 chars for length encoding)
  const contentHex = cleanHex.substring(8);
  
  // Convert hex to string
  let result = '';
  for (let i = 0; i < contentHex.length; i += 2) {
    result += String.fromCharCode(parseInt(contentHex.substr(i, 2), 16));
  }
  
  return result;
}

/**
 * Parse uint from hex representation
 */
function parseHexUint(hex: string): number {
  // Remove 0x01 prefix for uint type
  const cleanHex = hex.replace(/^0x01/, '');
  return parseInt(cleanHex, 16);
}

/**
 * Fetch transaction data from Stacks API
 */
async function fetchTransactionData(txId: string, network: string): Promise<ApiConfig | null> {
  try {
    const baseUrl = network === 'mainnet' 
      ? 'https://api.mainnet.hiro.so'
      : 'https://api.testnet.hiro.so';
    
    const url = `${baseUrl}/extended/v1/address/ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry/transactions?limit=50`;
    
    console.log(`🔍 Fetching transaction data from: ${url}`);
    
    const response = await axios.get<StacksApiResponse>(url, {
      timeout: 10000
    });
    
    // Find transaction by txId
    const transaction = response.data.results.find(tx => tx.tx_id === txId);
    
    if (!transaction) {
      console.error(`❌ Transaction not found: ${txId}`);
      return null;
    }
    
    // Verify transaction status
    if (transaction.tx_status !== 'success') {
      console.error(`❌ Transaction not successful: ${transaction.tx_status}`);
      return null;
    }
    
    // Verify it's a contract call
    if (!transaction.contract_call) {
      console.error('❌ Transaction is not a contract call');
      return null;
    }
    
    // Verify contract ID
    const expectedContractId = 'ST3AW560S3EET4NNSC3NG9N6CPNMPGASTMKWX11KG.api-registry';
    if (transaction.contract_call.contract_id !== expectedContractId) {
      console.error(`❌ Invalid contract ID: ${transaction.contract_call.contract_id}`);
      return null;
    }
    
    // Verify function name (create-api or update-api)
    const functionName = transaction.contract_call.function_name;
    if (functionName !== 'create-api' && functionName !== 'update-api') {
      console.error(`❌ Invalid function name: ${functionName}`);
      return null;
    }
    
    // Parse function arguments
    const args = transaction.contract_call.function_args;
    const apiNameArg = args.find(arg => arg.name === 'api-name');
    const allowedAgentsArg = args.find(arg => arg.name === 'allowed-agents');
    const cooldownBlocksArg = args.find(arg => arg.name === 'cooldown-blocks');
    const verifyAgentArg = args.find(arg => arg.name === 'verify-agent');
    
    if (!apiNameArg || !allowedAgentsArg || !cooldownBlocksArg || !verifyAgentArg) {
      console.error('❌ Missing required function arguments');
      return null;
    }
    
    const config: ApiConfig = {
      apiName: parseHexString(apiNameArg.hex),
      allowedAgents: parseHexString(allowedAgentsArg.hex),
      cooldownBlocks: parseHexUint(cooldownBlocksArg.hex),
      verifyAgent: verifyAgentArg.hex === '0x03', // 0x03 = true, 0x04 = false
      owner: '' // Not needed for validation
    };
    
    console.log(`✅ Transaction data parsed:`, {
      apiName: config.apiName,
      allowedAgents: config.allowedAgents,
      verifyAgent: config.verifyAgent
    });
    
    return config;
    
  } catch (error: any) {
    console.error('❌ Failed to fetch transaction data:', error.message);
    return null;
  }
}

/**
 * Create SHA256 hash
 */
function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Validate agent signature
 */
export async function validateAgentSignature(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('🔐 Starting agent signature validation...');
    
    // ============================================
    // STEP 1: Extract headers
    // ============================================
    
    const agentWallet = req.headers['x-agent-wallet'] as string;
    const agentSignature = req.headers['x-agent-signature'] as string;
    const agentTimestamp = req.headers['x-agent-timestamp'] as string;
    const validatorTxId = req.headers['x-validator-txid'] as string;
    
    // Check if all required headers are present
    if (!agentWallet || !agentSignature || !agentTimestamp || !validatorTxId) {
      console.error('❌ Missing required headers');
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_HEADERS',
          message: 'Missing required validation headers',
          required: ['x-agent-wallet', 'x-agent-signature', 'x-agent-timestamp', 'x-validator-txid']
        }
      });
    }
    
    console.log(`📋 Headers extracted:`, {
      agentWallet,
      timestamp: agentTimestamp,
      txId: validatorTxId
    });
    
    // ============================================
    // STEP 2: Extract apiId from URL
    // ============================================
    
    const pathParts = req.path.split('/');
    const apiId = pathParts[2]; // /w/:apiId/*
    
    if (!apiId) {
      console.error('❌ Invalid URL format - missing apiId');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'Invalid wrapper URL format'
        }
      });
    }
    
    // ============================================
    // STEP 3: Fetch transaction data from Stacks API
    // ============================================
    
    // Determine network from environment or default to testnet
    const network = process.env.STACKS_NETWORK || 'testnet';
    
    const apiConfig = await fetchTransactionData(validatorTxId, network);
    
    if (!apiConfig) {
      console.error('❌ Failed to fetch or parse transaction data');
      return res.status(403).json({
        success: false,
        error: {
          code: 'INVALID_TRANSACTION',
          message: 'Invalid or not found validator transaction'
        }
      });
    }
    
    // ============================================
    // STEP 4: Validate agent wallet against allowed agents
    // ============================================
    
    if (apiConfig.verifyAgent) {
      // Parse allowed agents (comma-separated list)
      const allowedAgentsList = apiConfig.allowedAgents
        .split(',')
        .map(agent => agent.trim())
        .filter(agent => agent.length > 0);
      
      console.log(`🔍 Checking agent wallet against allowed list:`, allowedAgentsList);
      
      // Check if agent wallet is in allowed list
      const isAllowed = allowedAgentsList.includes(agentWallet);
      
      if (!isAllowed) {
        console.error(`❌ Agent wallet not in allowed list: ${agentWallet}`);
        return res.status(403).json({
          success: false,
          error: {
            code: 'AGENT_NOT_ALLOWED',
            message: 'Agent wallet is not authorized for this API'
          }
        });
      }
      
      console.log(`✅ Agent wallet authorized: ${agentWallet}`);
    } else {
      console.log('⚠️ Agent verification disabled for this API');
    }
    
    // ============================================
    // STEP 5: Recreate canonical message and verify signature
    // ============================================
    
    // Create body hash
    const bodyHash = sha256(JSON.stringify(req.body || {}));
    
    // Create canonical message: apiId|timestamp|nonce|bodyHash
    // Note: Using apiId as endpoint identifier, timestamp as nonce
    const message = `${apiId}|${agentTimestamp}|${agentTimestamp}|${bodyHash}`;
    
    console.log(`📝 Canonical message created: ${message}`);
    
    // Verify signature using Stacks SDK
    try {
      const isValid = verifyMessageSignatureRsv({
        message,
        signature: agentSignature,
        publicKey: agentWallet
      });
      
      if (!isValid) {
        console.error('❌ Invalid signature');
        return res.status(403).json({
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Agent signature verification failed'
          }
        });
      }
      
      console.log('✅ Signature verified successfully');
      
    } catch (error: any) {
      console.error('❌ Signature verification error:', error.message);
      return res.status(403).json({
        success: false,
        error: {
          code: 'SIGNATURE_VERIFICATION_ERROR',
          message: 'Failed to verify agent signature',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
    
    // ============================================
    // STEP 6: Validation successful - continue to next middleware
    // ============================================
    
    console.log('✅ Agent validation successful - proceeding to payment verification');
    
    // Attach validated data to request for downstream use
    (req as any).validatedAgent = {
      wallet: agentWallet,
      timestamp: agentTimestamp,
      txId: validatorTxId,
      apiConfig
    };
    
    next();
    
  } catch (error: any) {
    console.error('❌ Agent validation unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'An unexpected error occurred during validation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
}
