import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../configs/database';
import { generateToken } from '../configs/jwt';
import { validate } from '../middleware/validation';
import { walletConnectSchema, registerSchema, loginSchema } from '../middleware/schemas';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Test endpoint to verify routing works
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Auth router is working!',
    timestamp: new Date().toISOString()
  });
});

// Register user
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, walletAddress } = req.body;

    // Check if user already exists with this email or wallet address
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { walletAddress }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email or wallet address already exists'
        }
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        walletAddress
      } as any
    });

    // Generate JWT token
    const token = generateToken({ 
      userId: user.id, 
      walletAddress: user.walletAddress 
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to register user'
      }
    });
  }
});

// Login user
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, walletAddress } = req.body;

    // First check if wallet address exists
    const userByWallet = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!userByWallet) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WALLET_NOT_FOUND',
          message: 'Wallet address not found'
        }
      });
    }

    // Then find user by email and verify it matches the wallet
    const user = await prisma.user.findFirst({
      where: { 
        email,
        walletAddress 
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or wallet address combination'
        }
      });
    }

    // Verify password
    if (!(user as any).password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_PASSWORD',
          message: 'User account has no password set'
        }
      });
    }

    const isPasswordValid = await bcrypt.compare(password, (user as any).password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid password'
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
          email: user.email,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to login'
      }
    });
  }
});



export default router; 