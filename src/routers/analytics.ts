import { Router, Response } from 'express';
import prisma from '../configs/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get API analytics
router.get('/:apiId/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { apiId } = req.params;
    const userId = req.user!.id;
    const { period = '30d' } = req.query as any;

    // Verify API ownership
    const api = await prisma.api.findFirst({
      where: { 
        id: apiId,
        userId 
      }
    });

    if (!api) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API not found or access denied'
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

    // Get analytics data
    const [requests, payments] = await Promise.all([
      prisma.apiRequest.findMany({
        where: {
          apiId,
          createdAt: { gte: startDate }
        }
      }),
      prisma.payment.findMany({
        where: {
          apiId,
          createdAt: { gte: startDate }
        }
      })
    ]);

    // Calculate metrics
    const totalRequests = requests.length;
    const successfulRequests = requests.filter(r => r.success).length;
    const successRate = totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(1) : '0.0';
    
    const avgResponseTime = totalRequests > 0 
      ? Math.round(requests.reduce((sum, r) => sum + r.responseMs, 0) / totalRequests)
      : 0;

    const successfulPayments = payments.filter(p => p.status === 'SUCCESS');
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const uniquePayers = new Set(successfulPayments.map(p => p.payerAddress).filter(Boolean));

    res.status(200).json({
      success: true,
      data: {
        requests: {
          total: totalRequests,
          successful: successfulRequests,
          successRate: `${successRate}%`,
          avgResponseTime: `${avgResponseTime}ms`
        },
        revenue: {
          total: totalRevenue,
          currency: 'SOL',
          paymentCount: successfulPayments.length
        },
        customers: {
          unique: uniquePayers.size
        }
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