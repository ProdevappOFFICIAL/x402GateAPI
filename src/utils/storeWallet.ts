import { PublicKey } from '@solana/web3.js';
import prisma from '../configs/database';

/**
 * Get store owner's wallet address
 */
export const getStoreOwnerWallet = async (storeId: string): Promise<PublicKey | null> => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { walletAddress: true }
        }
      }
    });

    if (!store) {
      return null;
    }

    return new PublicKey(store.owner.walletAddress);
  } catch (error) {
    console.error('Error getting store owner wallet:', error);
    return null;
  }
};

/**
 * Validate that a wallet address is a valid Solana public key
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get store with owner wallet info
 */
export const getStoreWithOwnerWallet = async (storeId: string) => {
  return await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      owner: {
        select: { 
          id: true,
          walletAddress: true 
        }
      }
    }
  });
};