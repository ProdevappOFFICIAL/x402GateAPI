// Simple Solana Pay Server Example
// This matches the code structure you provided

import express from "express";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import { encodeURL, findReference, validateTransfer } from "@solana/pay";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";

const app = express();
const connection = new Connection(clusterApiUrl("devnet")); // or mainnet
const prisma = new PrismaClient();

app.use(express.json());

// Replace with your actual merchant wallet
const MERCHANT_WALLET = "YOUR_MERCHANT_WALLET_ADDRESS_HERE";

// Create payment link
app.post("/api/create-payment", async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const merchantWallet = new PublicKey(MERCHANT_WALLET);
    const reference = new PublicKey(uuidv4()); // unique per order

    // Store reference + order in Prisma
    const order = await prisma.order.create({
      data: { 
        orderNumber: `#${Date.now()}`,
        customerWallet: "unknown", // You might want to get this from request
        totalAmount: amount, 
        currency: 'SOL',
        status: "PENDING",
        metadata: {
          paymentReference: reference.toString()
        }
      },
    });

    const url = encodeURL({
      recipient: merchantWallet,
      amount,
      reference,
      label: "SolStore",
      message: "Order Payment",
    });

    res.json({ 
      orderId: order.id,
      solanaPayUrl: url.toString(),
      reference: reference.toString()
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// Verify payment
app.get("/api/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const refKey = new PublicKey(reference);

    const tx = await findReference(connection, refKey, { finality: "confirmed" });
    
    await validateTransfer(connection, tx.signature, { 
      recipient: new PublicKey(MERCHANT_WALLET) 
    });

    // Update order status
    await prisma.order.updateMany({
      where: { 
        metadata: {
          path: ['paymentReference'],
          equals: reference
        }
      },
      data: { 
        status: "COMPLETED", 
        paymentTxHash: tx.signature 
      },
    });

    res.json({ success: true, txSignature: tx.signature });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.json({ success: false, message: "Payment not yet confirmed" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));