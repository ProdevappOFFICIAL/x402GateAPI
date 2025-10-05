import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

// Solana network configuration
export const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK as any);

// Create connection to Solana network
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Store wallet for receiving payments
export const STORE_WALLET = new PublicKey(
  process.env.STORE_WALLET_ADDRESS || 'So11111111111111111111111111111111111111112'
);

// Payment timeout (in seconds)
export const PAYMENT_TIMEOUT = parseInt(process.env.PAYMENT_TIMEOUT || '300'); // 5 minutes

// Supported tokens (add more as needed)
export const SUPPORTED_TOKENS = {
  SOL: {
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    symbol: 'SOL'
  },
  USDC: {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    symbol: 'USDC'
  }
};