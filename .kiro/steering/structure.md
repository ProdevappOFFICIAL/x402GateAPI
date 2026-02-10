# Project Structure

## Directory Organization

```
src/
├── index.ts           # Application entry point, server setup
├── configs/           # Configuration modules
│   ├── database.ts    # Prisma client instance
│   └── jwt.ts         # JWT configuration
├── middleware/        # Express middleware
│   ├── auth.ts        # Authentication middleware
│   └── errorHandler.ts # Global error handling
└── routers/           # API route handlers
    ├── auth.ts        # Authentication endpoints
    └── analytics.ts   # Analytics endpoints

prisma/
├── schema.prisma      # Database schema definition
└── migrations/        # Database migration files
```

## Architecture Patterns

### Entry Point (index.ts)
- Security middleware first (helmet, cors, rate limiting)
- Body parsing with size limits (10mb)
- Route mounting under versioned paths (`/v1/*`)
- Health check endpoint (`/health`)
- Global error handler last
- Graceful shutdown handling (SIGINT, SIGTERM)
- Database connection initialization before server start

### Database Layer
- Prisma ORM for type-safe database access
- Centralized client in `configs/database.ts`
- Connection verification on startup
- Proper disconnect on shutdown

### API Versioning
- Routes prefixed with version (`/v1/auth`, etc.)
- Maintains backward compatibility

### Error Handling
- Centralized error handler middleware
- Consistent error response format

## Conventions
- Use async/await for asynchronous operations
- Environment variables via dotenv (`.env` file)
- Emoji logging for visual clarity (✅, ❌, 🚀, etc.)
- TypeScript strict mode enforced
