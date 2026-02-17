import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import apiRoutes from "./routers/apis";
import authRoutes from "./routers/auth";
import { handleWrapper } from "./handlers/wrapperHandler";
import { errorHandler } from "./middleware/errorHandler";
import prisma from "./configs/database";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: ["https://x402-gaurd-ehic.vercel.app/"],
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
console.log('🔗 Mounting routes...');
app.use("/v1/apis", apiRoutes);
app.use("/auth", authRoutes);
console.log('✅ Routes mounted successfully');
console.log('   - /v1/apis/* (API management)');
console.log('   - /auth/* (Authentication)');

// Wrapper handler (public endpoint for payment-gated API access)
// Must be before error handler but after body parsing
app.all("/w/:apiId/*", handleWrapper);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "x402Gate API v1.0",
    documentation: "/docs",
    health: "/health",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);



const PORT = process.env.PORT || 4000;

// Database initialization
async function initializeDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection verified");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown() {
  console.log("🔄 Shutting down gracefully...");
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 x402Gate API server running on port ${PORT}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 API docs: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
