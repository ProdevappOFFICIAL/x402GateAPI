import { Router, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import prisma from '../configs/database';
import { validate } from '../middleware/validation';
import { 
  createPaymentURL, 
  verifyPayment, 
  generateReference, 
  toBigNumber,
  PaymentRequest 
} from '../utils/solana';
import { SUPPORTED_TOKENS } from '../configs/solana';
import { getStoreWithOwnerWallet } from '../utils/storeWallet';
import Joi from 'joi';

const router = Router();

// Validation schemas
const checkoutSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customerWallet: Joi.string().required(),
  customerEmail: Joi.string().email().optional(),
  currency: Joi.string().valid('SOL', 'USDC').default('SOL')
});

const verifyPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  signature: Joi.string().optional()
});

// Generate order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `#ORD-${timestamp}${random}`;
};

/**
 * Create checkout session with Solana Pay
 * POST /:storeId/checkout
 */
router.post('/:storeId/checkout', validate(checkoutSchema), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { productId, quantity = 1, customerWallet, customerEmail, currency = 'SOL' } = req.body;

    // Verify store exists and get owner's wallet
    const store = await getStoreWithOwnerWallet(storeId);

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

    // Validate customer wallet
    let customerPublicKey: PublicKey;
    try {
      customerPublicKey = new PublicKey(customerWallet);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WALLET',
          message: 'Invalid customer wallet address'
        }
      });
    }

    const totalAmount = Number(product.price) * quantity;
    const orderNumber = generateOrderNumber();
    const reference = generateReference();

    // Create order in database
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          storeId,
          orderNumber,
          customerWallet,
          customerEmail,
          totalAmount,
          currency,
          status: 'PENDING'
        }
      });

      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId,
          quantity,
          price: product.price
        }
      });

      // Reserve stock if not unlimited
      if (product.stock !== null) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: product.stock - quantity }
        });
      }

      return newOrder;
    });

    // Get store owner's wallet address
    const storeOwnerWallet = new PublicKey(store.owner.walletAddress);

    // Create Solana Pay payment request
    const paymentRequest: PaymentRequest = {
      recipient: storeOwnerWallet,
      amount: toBigNumber(totalAmount),
      reference,
      label: store.name,
      message: `Purchase ${product.name} from ${store.name}`,
      memo: `Order: ${orderNumber}`
    };

    // Add SPL token if not SOL
    if (currency !== 'SOL' && SUPPORTED_TOKENS[currency as keyof typeof SUPPORTED_TOKENS]) {
      const tokenInfo = SUPPORTED_TOKENS[currency as keyof typeof SUPPORTED_TOKENS];
      paymentRequest.splToken = new PublicKey(tokenInfo.mint);
    }

    const paymentURL = createPaymentURL(paymentRequest);

    // Store payment reference in order metadata
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          paymentReference: reference.toString(),
          paymentURL,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentURL,
        qrCode: paymentURL, // Can be used to generate QR code on frontend
        amount: totalAmount.toString(),
        currency,
        reference: reference.toString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        product: {
          id: product.id,
          name: product.name,
          price: product.price.toString()
        },
        store: {
          id: store.id,
          name: store.name
        }
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create checkout session'
      }
    });
  }
});

/**
 * Verify payment status
 * POST /:storeId/checkout/verify
 */
router.post('/:storeId/checkout/verify', validate(verifyPaymentSchema), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { orderId, signature } = req.body;

    // Find order
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        storeId,
        status: 'PENDING'
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
          message: 'Order not found or already processed'
        }
      });
    }

    // Check if order has expired
    const metadata = order.metadata as any;
    if (metadata?.expiresAt && new Date(metadata.expiresAt) < new Date()) {
      // Mark order as failed and restore stock
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'FAILED' }
        });

        // Restore stock
        for (const item of order.orderItems) {
          if (item.product.stock !== null) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: item.product.stock + item.quantity }
            });
          }
        }
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'ORDER_EXPIRED',
          message: 'Order has expired'
        }
      });
    }

    const paymentReference = metadata?.paymentReference;
    if (!paymentReference) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORDER',
          message: 'Order missing payment reference'
        }
      });
    }

    // Verify payment
    const reference = new PublicKey(paymentReference);
    const expectedAmount = toBigNumber(order.totalAmount.toString());
    
    let splToken: PublicKey | undefined;
    if (order.currency !== 'SOL' && SUPPORTED_TOKENS[order.currency as keyof typeof SUPPORTED_TOKENS]) {
      const tokenInfo = SUPPORTED_TOKENS[order.currency as keyof typeof SUPPORTED_TOKENS];
      splToken = new PublicKey(tokenInfo.mint);
    }

    // Get store owner's wallet for verification
    const storeWithOwner = await getStoreWithOwnerWallet(storeId);

    if (!storeWithOwner) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Store not found'
        }
      });
    }

    const storeOwnerWallet = new PublicKey(storeWithOwner.owner.walletAddress);

    const paymentStatus = await verifyPayment(
      reference,
      expectedAmount,
      storeOwnerWallet,
      splToken
    );

    if (paymentStatus.confirmed) {
      // Update order status to completed
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          paymentTxHash: paymentStatus.signature,
          updatedAt: new Date()
        }
      });

      res.status(200).json({
        success: true,
        data: {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          status: 'completed',
          paymentConfirmed: true,
          transactionSignature: paymentStatus.signature,
          paidAmount: paymentStatus.amount?.toString(),
          paidAt: paymentStatus.timestamp?.toISOString()
        }
      });
    } else {
      res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'pending',
          paymentConfirmed: false,
          message: 'Payment not yet confirmed'
        }
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to verify payment'
      }
    });
  }
});

/**
 * Get checkout status
 * GET /:storeId/checkout/:orderId/status
 */
router.get('/:storeId/checkout/:orderId/status', async (req, res) => {
  try {
    const { storeId, orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        storeId
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, price: true }
            }
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

    const metadata = order.metadata as any;
    
    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status.toLowerCase(),
        amount: order.totalAmount.toString(),
        currency: order.currency,
        paymentURL: metadata?.paymentURL,
        expiresAt: metadata?.expiresAt,
        transactionSignature: order.paymentTxHash,
        items: order.orderItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price.toString()
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Get checkout status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get checkout status'
      }
    });
  }
});

export default router;