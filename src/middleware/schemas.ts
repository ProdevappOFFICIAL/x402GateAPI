import Joi from 'joi';

// Auth schemas
export const walletConnectSchema = Joi.object({
  walletAddress: Joi.string().required().min(32).max(44),
  signature: Joi.string().required(),
  message: Joi.string().required()
});

// Store schemas
export const createStoreSchema = Joi.object({
  storeName: Joi.string().required().min(1).max(255),
  storeSlug: Joi.string().required().min(1).max(100).pattern(/^[a-z0-9-]+$/),
  storeIcon: Joi.string().optional().uri(),
  storeBanner: Joi.string().optional().uri(),
  description: Joi.string().optional().max(1000)
});

export const updateStoreSchema = Joi.object({
  name: Joi.string().optional().min(1).max(255),
  description: Joi.string().optional().max(1000),
  iconUrl: Joi.string().optional().uri(),
  bannerUrl: Joi.string().optional().uri(),
  settings: Joi.object({
    currency: Joi.string().optional().valid('SOL', 'USDC'),
    language: Joi.string().optional(),
    timezone: Joi.string().optional(),
    theme: Joi.string().optional().valid('light', 'dark'),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional()
    }).optional(),
    privacy: Joi.object({
      storeVisible: Joi.boolean().optional(),
      requireLogin: Joi.boolean().optional()
    }).optional()
  }).optional()
});

// Product schemas
export const createProductSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().max(2000),
  price: Joi.number().required().min(0),
  currency: Joi.string().optional().valid('SOL', 'USDC').default('SOL'),
  category: Joi.string().optional().max(100),
  stock: Joi.alternatives().try(
    Joi.number().integer().min(0),
    Joi.string().valid('unlimited')
  ).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().optional().valid('active', 'draft', 'inactive').default('active'),
  metadata: Joi.object({
    downloadUrl: Joi.string().optional(),
    fileSize: Joi.string().optional(),
    fileType: Joi.string().optional()
  }).optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional().min(1).max(255),
  description: Joi.string().optional().max(2000),
  price: Joi.number().optional().min(0),
  currency: Joi.string().optional().valid('SOL', 'USDC'),
  category: Joi.string().optional().max(100),
  stock: Joi.alternatives().try(
    Joi.number().integer().min(0),
    Joi.string().valid('unlimited')
  ).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().optional().valid('active', 'draft', 'inactive'),
  metadata: Joi.object().optional()
});

// Order schemas
export const createOrderSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customerEmail: Joi.string().email().optional(),
  customerWallet: Joi.string().required().min(32).max(44),
  paymentMethod: Joi.string().required().valid('solana')
});

export const updateOrderSchema = Joi.object({
  status: Joi.string().required().valid('completed', 'processing', 'failed', 'cancelled'),
  paymentTxHash: Joi.string().optional().min(64).max(88)
});

// Query schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

export const productQuerySchema = paginationSchema.keys({
  status: Joi.string().optional().valid('active', 'draft', 'inactive'),
  category: Joi.string().optional(),
  search: Joi.string().optional().max(255)
});

export const orderQuerySchema = paginationSchema.keys({
  status: Joi.string().optional().valid('completed', 'pending', 'processing', 'failed', 'cancelled'),
  search: Joi.string().optional().max(255)
});

export const analyticsQuerySchema = Joi.object({
  period: Joi.string().optional().valid('7d', '30d', '90d', '1y').default('30d')
});