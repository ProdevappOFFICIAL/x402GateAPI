import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Global error handler middleware
 * Ensures consistent error response format across all endpoints
 * Requirements: 9.1, 9.2
 */
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  // Log error details
  console.error('❌ Global error handler caught error:');
  console.error(`   Path: ${req.method} ${req.path}`);
  console.error(`   Error: ${error.message}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`   Stack: ${error.stack}`);
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`   Prisma Error Code: ${error.code}`);
    
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'A record with this value already exists',
            details: process.env.NODE_ENV === 'development' ? error.meta : undefined
          }
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Record not found',
            details: process.env.NODE_ENV === 'development' ? error.meta : undefined
          }
        });
      case 'P2003':
        return res.status(400).json({
          success: false,
          error: {
            code: 'FOREIGN_KEY_CONSTRAINT',
            message: 'Related record not found',
            details: process.env.NODE_ENV === 'development' ? error.meta : undefined
          }
        });
      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          }
        });
    }
  }

  // Validation errors (from Joi middleware)
  if (error.name === 'ValidationError' || error.isJoi) {
    console.error('   Validation Error:', error.details);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.details || error.message
      }
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    console.error('   JWT Error: Invalid token');
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authentication token'
      }
    });
  }

  if (error.name === 'TokenExpiredError') {
    console.error('   JWT Error: Token expired');
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token has expired'
      }
    });
  }

  // Default error
  return res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  });
};