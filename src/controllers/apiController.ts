import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../configs/database';

/**
 * Create a new API wrapper
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export const createApi = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    const {
      name,
      originalUrl,
      pricePerRequest,
      minPrice = 1,
      maxPrice = 1000,
      network,
      facilitatorUrl,
      stacksAddress
    } = req.body;

    // Validate that pricePerRequest is within bounds
    if (pricePerRequest < minPrice || pricePerRequest > maxPrice) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Price per request must be between ${minPrice} and ${maxPrice}`
        }
      });
    }

    // Create API record in database (Prisma will auto-generate the ID)
    const api = await prisma.api.create({
      data: {
        userId,
        name,
        originalUrl,
        wrapperUrl: '', // Temporary, will update after getting the ID
        pricePerRequest,
        minPrice,
        maxPrice,
        network,
        facilitatorUrl,
        stacksAddress,
        isActive: true
      }
    });

    // Generate wrapper URL using the auto-generated ID
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    const wrapperUrl = `${baseUrl}/w/${api.id}`;

    // Update the API record with the wrapper URL
    const updatedApi = await prisma.api.update({
      where: { id: api.id },
      data: { wrapperUrl }
    });

    console.log(`✅ API created: ${updatedApi.name} (${updatedApi.id})`);

    res.status(201).json({
      success: true,
      data: {
        apiId: updatedApi.id,
        name: updatedApi.name,
        originalUrl: updatedApi.originalUrl,
        wrapperUrl: updatedApi.wrapperUrl,
        pricePerRequest: updatedApi.pricePerRequest,
        minPrice: updatedApi.minPrice,
        maxPrice: updatedApi.maxPrice,
        network: updatedApi.network,
        facilitatorUrl: updatedApi.facilitatorUrl,
        stacksAddress: updatedApi.stacksAddress,
        isActive: updatedApi.isActive,
        createdAt: updatedApi.createdAt
      }
    });
  } catch (error: any) {
    console.error('❌ Error creating API:', error.message);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'An API with this configuration already exists'
        }
      });
    }
    
    next(error);
  }
};

/**
 * List all APIs for the authenticated user
 * Requirements: 2.1, 2.2
 */
export const listApis = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    // Fetch all APIs for the authenticated user
    const apis = await prisma.api.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Listed ${apis.length} APIs for user ${userId}`);

    res.status(200).json({
      success: true,
      data: apis.map(api => ({
        apiId: api.id,
        name: api.name,
        originalUrl: api.originalUrl,
        wrapperUrl: api.wrapperUrl,
        pricePerRequest: api.pricePerRequest,
        minPrice: api.minPrice,
        maxPrice: api.maxPrice,
        network: api.network,
        facilitatorUrl: api.facilitatorUrl,
        stacksAddress: api.stacksAddress,
        isActive: api.isActive,
        createdAt: api.createdAt
      }))
    });
  } catch (error: any) {
    console.error('❌ Error listing APIs:', error.message);
    next(error);
  }
};

/**
 * Get a single API by ID
 * Requirements: 2.3, 2.4
 */
export const getApi = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    // Fetch API and verify ownership
    const api = await prisma.api.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!api) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found or you do not have permission to access it'
        }
      });
    }

    console.log(`✅ Retrieved API: ${api.name} (${api.id})`);

    res.status(200).json({
      success: true,
      data: {
        apiId: api.id,
        name: api.name,
        originalUrl: api.originalUrl,
        wrapperUrl: api.wrapperUrl,
        pricePerRequest: api.pricePerRequest,
        minPrice: api.minPrice,
        maxPrice: api.maxPrice,
        network: api.network,
        facilitatorUrl: api.facilitatorUrl,
        stacksAddress: api.stacksAddress,
        isActive: api.isActive,
        createdAt: api.createdAt
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting API:', error.message);
    next(error);
  }
};

/**
 * Update an API configuration
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export const updateApi = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    // Verify API exists and user owns it
    const existingApi = await prisma.api.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingApi) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found or you do not have permission to update it'
        }
      });
    }

    const {
      pricePerRequest,
      minPrice,
      maxPrice,
      isActive,
      network,
      facilitatorUrl,
      stacksAddress
    } = req.body;

    // Build update data object with only provided fields
    const updateData: any = {};
    
    if (pricePerRequest !== undefined) updateData.pricePerRequest = pricePerRequest;
    if (minPrice !== undefined) updateData.minPrice = minPrice;
    if (maxPrice !== undefined) updateData.maxPrice = maxPrice;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (network !== undefined) updateData.network = network;
    if (facilitatorUrl !== undefined) updateData.facilitatorUrl = facilitatorUrl;
    if (stacksAddress !== undefined) updateData.stacksAddress = stacksAddress;

    // Get the effective min/max values (use existing if not being updated)
    const effectiveMinPrice = minPrice !== undefined ? minPrice : existingApi.minPrice || 1;
    const effectiveMaxPrice = maxPrice !== undefined ? maxPrice : existingApi.maxPrice || 1000;
    const effectivePrice = pricePerRequest !== undefined ? pricePerRequest : existingApi.pricePerRequest;

    // Clamp pricePerRequest between minPrice and maxPrice
    if (pricePerRequest !== undefined || minPrice !== undefined || maxPrice !== undefined) {
      const clampedPrice = Math.max(effectiveMinPrice, Math.min(effectiveMaxPrice, effectivePrice));
      
      if (clampedPrice !== effectivePrice) {
        updateData.pricePerRequest = clampedPrice;
        console.log(`⚠️ Price clamped from ${effectivePrice} to ${clampedPrice} (min: ${effectiveMinPrice}, max: ${effectiveMaxPrice})`);
      }
    }

    // Update the API
    const updatedApi = await prisma.api.update({
      where: { id },
      data: updateData
    });

    console.log(`✅ API updated: ${updatedApi.name} (${updatedApi.id})`);

    res.status(200).json({
      success: true,
      data: {
        apiId: updatedApi.id,
        name: updatedApi.name,
        originalUrl: updatedApi.originalUrl,
        wrapperUrl: updatedApi.wrapperUrl,
        pricePerRequest: updatedApi.pricePerRequest,
        minPrice: updatedApi.minPrice,
        maxPrice: updatedApi.maxPrice,
        network: updatedApi.network,
        facilitatorUrl: updatedApi.facilitatorUrl,
        stacksAddress: updatedApi.stacksAddress,
        isActive: updatedApi.isActive,
        createdAt: updatedApi.createdAt
      }
    });
  } catch (error: any) {
    console.error('❌ Error updating API:', error.message);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found'
        }
      });
    }
    
    next(error);
  }
};

/**
 * Delete an API
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export const deleteApi = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    // Verify API exists and user owns it
    const existingApi = await prisma.api.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingApi) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found or you do not have permission to delete it'
        }
      });
    }

    // Delete the API (cascade will handle related records)
    await prisma.api.delete({
      where: { id }
    });

    console.log(`✅ API deleted: ${existingApi.name} (${existingApi.id})`);

    res.status(200).json({
      success: true,
      message: 'API deleted successfully',
      data: {
        apiId: existingApi.id,
        name: existingApi.name
      }
    });
  } catch (error: any) {
    console.error('❌ Error deleting API:', error.message);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found'
        }
      });
    }
    
    next(error);
  }
};

/**
 * Get metrics for an API
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export const getApiMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    // Verify API exists and user owns it
    const api = await prisma.api.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!api) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found or you do not have permission to access it'
        }
      });
    }

    // Calculate total request count
    const totalRequests = await prisma.apiRequest.count({
      where: { apiId: id }
    });

    // Calculate successful requests
    const successfulRequests = await prisma.apiRequest.count({
      where: {
        apiId: id,
        success: true
      }
    });

    // Calculate success rate (handle zero-request edge case)
    const successRate = totalRequests > 0 
      ? (successfulRequests / totalRequests) * 100 
      : 0;

    // Calculate total revenue from successful payments
    const paymentsResult = await prisma.payment.aggregate({
      where: {
        apiId: id,
        status: 'SUCCESS'
      },
      _sum: {
        amount: true
      }
    });

    const totalRevenue = paymentsResult._sum.amount || 0;

    console.log(`✅ Retrieved metrics for API: ${api.name} (${api.id})`);

    res.status(200).json({
      success: true,
      data: {
        apiId: api.id,
        apiName: api.name,
        metrics: {
          totalRequests,
          successfulRequests,
          failedRequests: totalRequests - successfulRequests,
          successRate: parseFloat(successRate.toFixed(2)),
          totalRevenue: parseFloat(totalRevenue.toFixed(2))
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting API metrics:', error.message);
    next(error);
  }
};
