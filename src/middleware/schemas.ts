import Joi from 'joi';

/**
 * Validation schema for user registration
 */
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  
  walletAddress: Joi.string().required().pattern(/^S[A-Z0-9]{38,40}$/).messages({
    'string.pattern.base': 'Wallet address must be a valid Stacks address starting with S',
    'any.required': 'Wallet address is required'
  }),
  
  name: Joi.string().optional().max(255).messages({
    'string.max': 'Name must not exceed 255 characters'
  })
});

/**
 * Validation schema for user login
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  }),
  
  walletAddress: Joi.string().required().pattern(/^S[A-Z0-9]{38,40}$/).messages({
    'string.pattern.base': 'Wallet address must be a valid Stacks address starting with S',
    'any.required': 'Wallet address is required'
  })
});

/**
 * Validation schema for wallet connection (wallet-only auth)
 */
export const walletConnectSchema = Joi.object({
  walletAddress: Joi.string().required().pattern(/^S[A-Z0-9]{38,40}$/).messages({
    'string.pattern.base': 'Wallet address must be a valid Stacks address starting with S',
    'any.required': 'Wallet address is required'
  }),
  
  signature: Joi.string().optional().messages({
    'string.base': 'Signature must be a string'
  }),
  
  message: Joi.string().optional().messages({
    'string.base': 'Message must be a string'
  })
});

/**
 * Validation schema for wallet connection
 */

/**
 * Validation schema for API creation
 * Requirements: 1.1, 1.4, 1.5
 */
export const createApiSchema = Joi.object({
  name: Joi.string().required().min(1).max(255).messages({
    'string.empty': 'API name is required',
    'string.min': 'API name must be at least 1 character',
    'string.max': 'API name must not exceed 255 characters',
    'any.required': 'API name is required'
  }),
  
  originalUrl: Joi.string().uri().required().messages({
    'string.uri': 'Original URL must be a valid URI',
    'any.required': 'Original URL is required'
  }),
  
  pricePerRequest: Joi.number().positive().required().messages({
    'number.positive': 'Price per request must be a positive number',
    'any.required': 'Price per request is required'
  }),
  
  minPrice: Joi.number().positive().default(1).messages({
    'number.positive': 'Minimum price must be a positive number'
  }),
  
  maxPrice: Joi.number().positive().default(1000).messages({
    'number.positive': 'Maximum price must be a positive number'
  }),
  
  network: Joi.string().valid('TESTNET', 'MAINNET').required().messages({
    'any.only': 'Network must be either TESTNET or MAINNET',
    'any.required': 'Network is required'
  }),
  
  facilitatorUrl: Joi.string().uri().required().messages({
    'string.uri': 'Facilitator URL must be a valid URI',
    'any.required': 'Facilitator URL is required'
  }),
  
  stacksAddress: Joi.string().required().pattern(/^S[A-Z0-9]{38,40}$/).messages({
    'string.pattern.base': 'Stacks address must be a valid address starting with S followed by 38-40 alphanumeric characters',
    'any.required': 'Stacks address is required'
  })
}).custom((value, helpers) => {
  // Validate that minPrice <= maxPrice
  if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
    return helpers.error('any.invalid', { 
      message: 'Minimum price cannot be greater than maximum price' 
    });
  }
  
  // Validate that pricePerRequest is within bounds if minPrice/maxPrice are provided
  if (value.minPrice && value.pricePerRequest < value.minPrice) {
    return helpers.error('any.invalid', { 
      message: 'Price per request cannot be less than minimum price' 
    });
  }
  
  if (value.maxPrice && value.pricePerRequest > value.maxPrice) {
    return helpers.error('any.invalid', { 
      message: 'Price per request cannot be greater than maximum price' 
    });
  }
  
  return value;
});

/**
 * Validation schema for API updates
 * Requirements: 3.1, 3.2, 3.3
 */
export const updateApiSchema = Joi.object({
  pricePerRequest: Joi.number().positive().messages({
    'number.positive': 'Price per request must be a positive number'
  }),
  
  minPrice: Joi.number().positive().messages({
    'number.positive': 'Minimum price must be a positive number'
  }),
  
  maxPrice: Joi.number().positive().messages({
    'number.positive': 'Maximum price must be a positive number'
  }),
  
  isActive: Joi.boolean().messages({
    'boolean.base': 'isActive must be a boolean value'
  }),
  
  network: Joi.string().valid('TESTNET', 'MAINNET').messages({
    'any.only': 'Network must be either TESTNET or MAINNET'
  }),
  
  facilitatorUrl: Joi.string().uri().messages({
    'string.uri': 'Facilitator URL must be a valid URI'
  }),
  
  stacksAddress: Joi.string().pattern(/^S[A-Z0-9]{38,40}$/).messages({
    'string.pattern.base': 'Stacks address must be a valid address starting with S followed by 38-40 alphanumeric characters'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
}).custom((value, helpers) => {
  // Validate that minPrice <= maxPrice if both are being updated
  if (value.minPrice !== undefined && value.maxPrice !== undefined && value.minPrice > value.maxPrice) {
    return helpers.error('any.invalid', { 
      message: 'Minimum price cannot be greater than maximum price' 
    });
  }
  
  return value;
});
