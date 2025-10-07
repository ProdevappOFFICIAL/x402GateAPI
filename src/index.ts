import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routers/auth";
import storeRoutes from "./routers/stores";
import productRoutes from "./routers/products";
import orderRoutes from "./routers/orders";
import checkoutRoutes from "./routers/checkout";
import analyticsRoutes from "./routers/analytics";
import uploadRoutes from "./routers/upload";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: ["https://web-store-mauve.vercel.app", "http://localhost:3000"],
    credentials: true,
  })
);

// Rate limiting
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
*/

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/v1/auth", authRoutes);
app.use("/v1/stores", storeRoutes);
app.use("/v1/stores", productRoutes);
app.use("/v1/stores", orderRoutes);
app.use("/v1/stores", checkoutRoutes);
app.use("/v1/stores", analyticsRoutes);
app.use("/v1/upload", uploadRoutes);
app.use("/v1/stores", checkoutRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "SolStore API v1.0",
    documentation: "/docs",
    health: "/health",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 SolStore API server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || "development"}`);
});
