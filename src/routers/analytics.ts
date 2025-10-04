import { Router, Response } from 'express';
import prisma from '../configs/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { analyticsQuerySchema } from '../middleware/schemas';

const router = Router();

// Get store analytics
router.get('/:storeId/analytics', authenticateToken, validateQuery(analyticsQuerySchema), async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const userId = req.user!.id;
    const { period = '30d' } = req.query as any;

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

    // Calculate date range
    const now = new Date();
    const periodDays: { [key: string]: number } = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const daysBack = periodDays[period] || 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Get current period data
    const [
      currentOrders,
      previousOrders,
      products,
      topProducts,
      recentOrders
    ] = await Promise.all([
      // Current period orders
      prisma.order.findMany({
        where: {
          storeId,
          createdAt: { gte: startDate }
        },
        select: {
          totalAmount: true,
          currency: true,
          status: true,
          customerWallet: true
        }
      }),
      
      // Previous period orders (for comparison)
      prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000)),
            lt: startDate
          }
        },
        select: {
          totalAmount: true,
          status: true,
          customerWallet: true
        }
      }),
      
      // Products
      prisma.product.findMany({
        where: { storeId },
        select: {
          id: true,
          name: true,
          status: true,
          orderItems: {
            include: {
              order: {
                select: {
                  status: true,
                  totalAmount: true,
                  createdAt: true
                }
              }
            }
          }
        }
      }),
      
      // Top products by sales
      prisma.product.findMany({
        where: { storeId },
        include: {
          orderItems: {
            where: {
              order: {
                status: 'COMPLETED',
                createdAt: { gte: startDate }
              }
            },
            include: {
              order: true
            }
          }
        },
        take: 5
      }),
      
      // Recent orders
      prisma.order.findMany({
        where: { storeId },
        include: {
          orderItems: {
            include: {
              product: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Calculate current period metrics
    const completedOrders = currentOrders.filter(order => order.status === 'COMPLETED');
    const currentRevenue = completedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const currentOrderCount = completedOrders.length;
    
    // Get unique customers
    const uniqueCustomers = new Set(completedOrders.map(order => order.customerWallet));
    const currentCustomerCount = uniqueCustomers.size;

    // Calculate previous period metrics for comparison
    const previousCompletedOrders = previousOrders.filter(order => order.status === 'COMPLETED');
    const previousRevenue = previousCompletedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const previousOrderCount = previousCompletedOrders.length;
    const previousUniqueCustomers = new Set(previousCompletedOrders.map(order => order.customerWallet));
    const previousCustomerCount = previousUniqueCustomers.size;

    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : currentRevenue > 0 ? '100.0' : '0.0';
    
    const orderChange = previousOrderCount > 0 
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount * 100).toFixed(1)
      : currentOrderCount > 0 ? '100.0' : '0.0';
    
    const customerChange = previousCustomerCount > 0 
      ? ((currentCustomerCount - previousCustomerCount) / previousCustomerCount * 100).toFixed(1)
      : currentCustomerCount > 0 ? '100.0' : '0.0';

    // Calculate product stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
    const draftProducts = products.filter(p => p.status === 'DRAFT').length;

    // Calculate top products
    const topProductsWithStats = topProducts
      .map(product => {
        const completedItems = product.orderItems.filter(
          item => item.order.status === 'COMPLETED'
        );
        const sales = completedItems.reduce((sum, item) => sum + item.quantity, 0);
        const revenue = completedItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
        
        return {
          name: product.name,
          sales,
          revenue: revenue.toString()
        };
      })
      .filter(product => product.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Format recent orders
    const recentOrdersFormatted = recentOrders.map(order => ({
      id: order.orderNumber,
      customer: order.customerWallet,
      product: order.orderItems[0]?.product?.name || 'Unknown Product',
      amount: order.totalAmount.toString(),
      status: order.status.toLowerCase()
    }));

    res.status(200).json({
      success: true,
      data: {
        revenue: {
          total: currentRevenue.toString(),
          currency: 'SOL',
          change: `${revenueChange.startsWith('-') ? '' : '+'}${revenueChange}%`
        },
        orders: {
          total: currentOrderCount,
          change: `${orderChange.startsWith('-') ? '' : '+'}${orderChange}%`
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          draft: draftProducts
        },
        customers: {
          total: currentCustomerCount,
          change: `${customerChange.startsWith('-') ? '' : '+'}${customerChange}%`
        },
        topProducts: topProductsWithStats,
        recentOrders: recentOrdersFormatted
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch analytics'
      }
    });
  }
});

export default router;