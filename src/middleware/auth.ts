import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../configs/jwt';
import prisma from '../configs/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token required'
        }
      });
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, walletAddress: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token - user not found'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      }
    });
  }
};

export const authenticateWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const walletAddress = req.headers['x-wallet-address'] as string;
    const signature = req.headers['x-wallet-signature'] as string;

    if (!walletAddress || !signature) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'WALLET_NOT_CONNECTED',
          message: 'Wallet address and signature required'
        }
      });
    }

    // In a real implementation, you would verify the Solana signature here
    // For now, we'll just check if the wallet exists in our database
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true, walletAddress: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Wallet not registered'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Wallet authentication failed'
      }
    });
  }
};