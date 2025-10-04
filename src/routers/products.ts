import { Router, Response } from 'express';
import prisma from '../configs/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../middleware/schemas';

const router = Router();

// Create product
router.post('/:storeId/products', authenticateToken, validate(createProductSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const userId = req.user!.id;
    const productData = req.body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: { 
        id: storeId,
        ownerId: userId 
      }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Store not found or access denied'
        }
      });
    }

    // Convert stock value
    const stockValue = productData.stock === 'unlimited' ? null : productData.stock;

    // Map status to enum
    const statusMap: { [key: string]: any } = {
      'active': 'ACTIVE',
      'draft': 'DRAFT',
      'inactive': 'INACTIVE'
    };

    const product = await prisma.product.create({
      data: {
        storeId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        currency: productData.currency || 'SOL',
        category: productData.category,
        stock: stockValue,
        images: productData.images || [],
        metadata: productData.metadata || {},
        status: statusMap[productData.status] || 'ACTIVE'
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        currency: product.currency,
        category: product.category,
        stock: product.stock === null ? 'unlimited' : product.stock,
        sales: 0,
        revenue: '0',
        status: product.status.toLowerCase(),
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create product'
      }
    });
  }
});

// Get store products
router.get('/:storeId/products', validateQuery(productQuerySchema), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { page = 1, limit = 20, status, category, search } = req.query as any;
    
    // Convert pagination parameters to numbers
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;

    // Build where clause
    const where: any = { storeId };
    
    if (status) {
      const statusMap: { [key: string]: any } = {
        'active': 'ACTIVE',
        'draft': 'DRAFT',
        'inactive': 'INACTIVE'
      };
      where.status = statusMap[status];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          orderItems: {
            include: {
              order: {
                select: { status: true, totalAmount: true }
              }
            }
          }
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const productsWithStats = products.map(product => {
      const completedOrders = product.orderItems.filter(
        item => item.order.status === 'COMPLETED'
      );
      
      const sales = completedOrders.reduce((sum, item) => sum + item.quantity, 0);
      const revenue = completedOrders.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        currency: product.currency,
        sales,
        revenue: revenue.toString(),
        status: product.status.toLowerCase(),
        category: product.category,
        stock: product.stock === null ? 'unlimited' : product.stock,
        images: product.images
      };
    });

    res.status(200).json({
      success: true,
      data: {
        products: productsWithStats,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch products'
      }
    });
  }
});

// Get single product
router.get('/:storeId/products/:productId', async (req, res) => {
  try {
    const { storeId, productId } = req.params;

    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        storeId 
      },
      include: {
        store: {
          select: { name: true, slug: true }
        },
        orderItems: {
          include: {
            order: {
              select: { status: true }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    const sales = product.orderItems.filter(
      item => item.order.status === 'COMPLETED'
    ).reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        currency: product.currency,
        category: product.category,
        stock: product.stock === null ? 'unlimited' : product.stock,
        images: product.images,
        metadata: product.metadata,
        status: product.status.toLowerCase(),
        sales,
        store: product.store,
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch product'
      }
    });
  }
});

// Update product
router.put('/:storeId/products/:productId', authenticateToken, validate(updateProductSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, productId } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: { 
        id: storeId,
        ownerId: userId 
      }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Store not found or access denied'
        }
      });
    }

    // Check if product exists in this store
    const existingProduct = await prisma.product.findFirst({
      where: { 
        id: productId,
        storeId 
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Prepare update data
    const updatePayload: any = {};
    
    if (updateData.name) updatePayload.name = updateData.name;
    if (updateData.description !== undefined) updatePayload.description = updateData.description;
    if (updateData.price) updatePayload.price = updateData.price;
    if (updateData.currency) updatePayload.currency = updateData.currency;
    if (updateData.category !== undefined) updatePayload.category = updateData.category;
    if (updateData.images) updatePayload.images = updateData.images;
    if (updateData.metadata) updatePayload.metadata = updateData.metadata;
    
    if (updateData.stock !== undefined) {
      updatePayload.stock = updateData.stock === 'unlimited' ? null : updateData.stock;
    }
    
    if (updateData.status) {
      const statusMap: { [key: string]: any } = {
        'active': 'ACTIVE',
        'draft': 'DRAFT',
        'inactive': 'INACTIVE'
      };
      updatePayload.status = statusMap[updateData.status];
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updatePayload
    });

    res.status(200).json({
      success: true,
      data: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price.toString(),
        currency: updatedProduct.currency,
        category: updatedProduct.category,
        stock: updatedProduct.stock === null ? 'unlimited' : updatedProduct.stock,
        status: updatedProduct.status.toLowerCase(),
        updatedAt: updatedProduct.updatedAt
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update product'
      }
    });
  }
});

// Delete product
router.delete('/:storeId/products/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, productId } = req.params;
    const userId = req.user!.id;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: { 
        id: storeId,
        ownerId: userId 
      }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Store not found or access denied'
        }
      });
    }

    // Check if product exists in this store
    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        storeId 
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Product deleted successfully'
      }
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete product'
      }
    });
  }
});

export default router;