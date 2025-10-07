import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

// Solana network configuration
export const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';

// For production, use a dedicated RPC endpoint for better reliability
export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 
  (SOLANA_NETWORK === 'mainnet-beta' 
    ? 'https://api.mainnet-beta.solana.com' 
    : clusterApiUrl(SOLANA_NETWORK as any));

// Create connection to Solana network
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Note: Store wallet addresses are now dynamic per store owner
// Each store uses the owner's wallet address from the database
// No global STORE_WALLET needed anymore

// Payment timeout (in seconds)
export const PAYMENT_TIMEOUT = parseInt(process.env.PAYMENT_TIMEOUT || '300'); // 5 minutes

// Supported tokens for mainnet
export const SUPPORTED_TOKENS = {
  SOL: {
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    symbol: 'SOL'
  },
  USDC: {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mainnet
    decimals: 6,
    symbol: 'USDC'
  },
  USDT: {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT mainnet
    decimals: 6,
    symbol: 'USDT'
  }
};