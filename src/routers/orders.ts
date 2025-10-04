import { Router, Response } from 'express';
import prisma from '../configs/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createOrderSchema, updateOrderSchema, orderQuerySchema } from '../middleware/schemas';

const router = Router();

// Generate order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `#ORD-${timestamp}${random}`;
};

// Create order
router.post('/:storeId/orders', validate(createOrderSchema), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { productId, quantity = 1, customerEmail, customerWallet, paymentMethod } = req.body;

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Store not found'
        }
      });
    }

    // Verify product exists and is available
    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        storeId,
        status: 'ACTIVE'
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found or not available'
        }
      });
    }

    // Check stock availability
    if (product.stock !== null && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PRODUCT_OUT_OF_STOCK',
          message: 'Insufficient stock available'
        }
      });
    }

    const totalAmount = Number(product.price) * quantity;
    const orderNumber = generateOrderNumber();

    // Create order and order item in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          storeId,
          orderNumber,
          customerWallet,
          customerEmail,
          totalAmount,
          currency: product.currency,
          status: 'PENDING'
        }
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId,
          quantity,
          price: product.price
        }
      });

      // Update stock if not unlimited
      if (product.stock !== null) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: product.stock - quantity }
        });
      }

      return order;
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        orderId: result.orderNumber,
        productId,
        customerId: customerWallet,
        amount: result.totalAmount.toString(),
        currency: result.currency,
        status: result.status.toLowerCase(),
        paymentTxHash: result.paymentTxHash,
        createdAt: result.createdAt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create order'
      }
    });
  }
});

// Get store orders
router.get('/:storeId/orders', authenticateToken, validateQuery(orderQuerySchema), async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 20, status, search } = req.query as any;
    
    // Convert pagination parameters to numbers
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;

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

    // Build where clause
    const where: any = { storeId };
    
    if (status) {
      const statusMap: { [key: string]: any } = {
        'completed': 'COMPLETED',
        'pending': 'PENDING',
        'processing': 'PROCESSING',
        'failed': 'FAILED',
        'cancelled': 'CANCELLED'
      };
      where.status = statusMap[status];
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerWallet: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                select: { id: true, name: true }
              }
            }
          }
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    const ordersWithDetails = orders.map(order => ({
      id: order.id,
      orderId: order.orderNumber,
      customer: {
        wallet: order.customerWallet,
        email: order.customerEmail
      },
      product: order.orderItems[0]?.product || null,
      amount: order.totalAmount.toString(),
      currency: order.currency,
      status: order.status.toLowerCase(),
      paymentTxHash: order.paymentTxHash,
      createdAt: order.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: ordersWithDetails,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch orders'
      }
    });
  }
});

// Get single order
router.get('/:storeId/orders/:orderId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, orderId } = req.params;
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

    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        storeId 
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: order.id,
        orderId: order.orderNumber,
        customer: {
          wallet: order.customerWallet,
          email: order.customerEmail
        },
        items: order.orderItems.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.price.toString()
          },
          quantity: item.quantity,
          subtotal: (Number(item.price) * item.quantity).toString()
        })),
        totalAmount: order.totalAmount.toString(),
        currency: order.currency,
        status: order.status.toLowerCase(),
        paymentTxHash: order.paymentTxHash,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch order'
      }
    });
  }
});

// Update order status
router.put('/:storeId/orders/:orderId', authenticateToken, validate(updateOrderSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, orderId } = req.params;
    const userId = req.user!.id;
    const { status, paymentTxHash } = req.body;

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

    // Check if order exists
    const existingOrder = await prisma.order.findFirst({
      where: { 
        id: orderId,
        storeId 
      }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    // Map status to enum
    const statusMap: { [key: string]: any } = {
      'completed': 'COMPLETED',
      'processing': 'PROCESSING',
      'failed': 'FAILED',
      'cancelled': 'CANCELLED'
    };

    const updateData: any = {
      status: statusMap[status]
    };

    if (paymentTxHash) {
      updateData.paymentTxHash = paymentTxHash;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    res.status(200).json({
      success: true,
      data: {
        id: updatedOrder.id,
        orderId: updatedOrder.orderNumber,
        status: updatedOrder.status.toLowerCase(),
        paymentTxHash: updatedOrder.paymentTxHash,
        updatedAt: updatedOrder.updatedAt
      }
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update order'
      }
    });
  }
});

export default router;