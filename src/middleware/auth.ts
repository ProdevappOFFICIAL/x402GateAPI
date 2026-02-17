import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../configs/jwt';
import prisma from '../configs/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    walletAddress: string | null;
  };
  apiKey?: {
    id: string;
    userId: string;
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

    if (!user.walletAddress) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User has no wallet address'
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

    if (!user.walletAddress) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User has no wallet address'
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

/**
 * Authenticate using API key for public/third-party access
 * Allows tracking usage without requiring login
 */
export const authenticateApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_REQUIRED',
          message: 'API key required. Include X-API-Key header.'
        }
      });
    }

    // Find and validate API key
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      select: { 
        id: true, 
        userId: true, 
        isActive: true,
        user: {
          select: {
            id: true,
            walletAddress: true
          }
        }
      }
    });

    if (!keyRecord) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid API key'
        }
      });
    }

    if (!keyRecord.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_DISABLED',
          message: 'This API key has been disabled'
        }
      });
    }

    // Update last used timestamp (fire and forget)
    prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() }
    }).catch(err => console.error('Failed to update API key lastUsedAt:', err));

    // Attach both apiKey and user info to request
    req.apiKey = {
      id: keyRecord.id,
      userId: keyRecord.userId
    };
    req.user = keyRecord.user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'API key authentication failed'
      }
    });
  }
};

/**
 * Flexible auth: accepts either JWT token OR API key
 * Useful for endpoints that support both authenticated users and third-party access
 */
export const authenticateFlexible = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'] as string;

  // Try API key first
  if (apiKey) {
    return authenticateApiKey(req, res, next);
  }

  // Fall back to JWT token
  if (authHeader) {
    return authenticateToken(req, res, next);
  }

  return res.status(401).json({
    success: false,
    error: {
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication required. Provide either Authorization header (JWT) or X-API-Key header.'
    }
  });
};
