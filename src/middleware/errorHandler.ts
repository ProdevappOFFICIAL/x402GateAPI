import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'A record with this value already exists',
            details: error.meta
          }
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Record not found',
            details: error.meta
          }
        });
      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed',
            details: error.message
          }
        });
    }
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.details
      }
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token'
      }
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  });
};