import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

/**
 * Generic validation middleware factory
 * Validates request body against a Joi schema
 * 
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
      convert: true // Convert types (e.g., string to number)
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors
        }
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};
