import { Router, Request, Response } from 'express';
import prisma from '../configs/database';
import { generateToken } from '../configs/jwt';
import { validate } from '../middleware/validation';
import { walletConnectSchema } from '../middleware/schemas';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Connect wallet and authenticate
router.post('/wallet/connect', validate(walletConnectSchema), async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // In a real implementation, you would verify the Solana signature here
    // For now, we'll simulate signature verification
    if (!signature || signature.length < 64) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid wallet signature'
        }
      });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          email: null
        }
      });
    }

    // Generate JWT token
    const token = generateToken({ 
      userId: user.id, 
      walletAddress: user.walletAddress 
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Wallet connect error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to connect wallet'
      }
    });
  }
});

// Verify token
router.get('/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        valid: true,
        user: {
          id: req.user!.id,
          walletAddress: req.user!.walletAddress
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to verify token'
      }
    });
  }
});

export default router;