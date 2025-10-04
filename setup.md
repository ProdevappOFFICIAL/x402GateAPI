# SolStore API Setup Guide

## Quick Setup Steps

1. **Install Dependencies** (if not already done)
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your database URL and other settings.

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database (creates tables)
   npx prisma db push
   
   # Optional: Seed with sample data
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:4000`

## Testing the API

1. Use the `api.rest` file with REST Client extension in VS Code
2. First, connect a wallet to get an auth token
3. Replace `your_jwt_token_here` in the api.rest file with the actual token
4. Test other endpoints

## Database Management

- **View Database**: `npx prisma studio`
- **Reset Database**: `npx prisma db push --force-reset`
- **Generate Client**: `npx prisma generate`

## API Endpoints Summary

- **Auth**: `/v1/auth/wallet/connect`, `/v1/auth/verify`
- **Stores**: `/v1/stores` (CRUD operations)
- **Products**: `/v1/stores/:storeId/products` (CRUD operations)
- **Orders**: `/v1/stores/:storeId/orders` (CRUD operations)
- **Analytics**: `/v1/stores/:storeId/analytics`

All endpoints are fully implemented with proper validation, error handling, and security measures.