# SolStore API Implementation

This is the complete backend API implementation for SolStore, a Web3 ecommerce platform for creators and developers to create, manage and sell digital products powered by blockchain technology.

## 🚀 Features

- **Authentication**: JWT-based authentication with Solana wallet integration
- **Store Management**: Create, update, and manage multiple stores
- **Product Management**: Full CRUD operations for digital products
- **Order Processing**: Complete order lifecycle management
- **Analytics**: Comprehensive store analytics and reporting
- **Security**: Rate limiting, input validation, and secure headers
- **Database**: PostgreSQL with Prisma ORM
- **TypeScript**: Full type safety throughout the application

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solstore-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/solstore_db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   PORT=4000
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed database with sample data (optional)
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:4000/v1
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Available Endpoints

#### Authentication
- `POST /auth/wallet/connect` - Connect Solana wallet and get JWT token
- `GET /auth/verify` - Verify JWT token validity

#### Stores
- `POST /stores` - Create a new store
- `GET /stores` - Get user's stores
- `GET /stores/:storeSlug` - Get store by slug (public)
- `PUT /stores/:storeId` - Update store
- `DELETE /stores/:storeId` - Delete store

#### Products
- `POST /stores/:storeId/products` - Create product
- `GET /stores/:storeId/products` - Get store products
- `GET /stores/:storeId/products/:productId` - Get single product
- `PUT /stores/:storeId/products/:productId` - Update product
- `DELETE /stores/:storeId/products/:productId` - Delete product

#### Orders
- `POST /stores/:storeId/orders` - Create order
- `GET /stores/:storeId/orders` - Get store orders
- `GET /stores/:storeId/orders/:orderId` - Get single order
- `PUT /stores/:storeId/orders/:orderId` - Update order status

#### Analytics
- `GET /stores/:storeId/analytics` - Get store analytics

## 🔧 API Usage Examples

### Connect Wallet
```bash
curl -X POST http://localhost:4000/v1/auth/wallet/connect \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "signature": "sample_signature_here",
    "message": "Sign in to SolStore"
  }'
```

### Create Store
```bash
curl -X POST http://localhost:4000/v1/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "storeName": "My Digital Store",
    "storeSlug": "my-digital-store",
    "description": "Selling amazing digital products"
  }'
```

### Create Product
```bash
curl -X POST http://localhost:4000/v1/stores/<store_id>/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "name": "Digital Art Collection",
    "description": "Beautiful digital artwork",
    "price": 2.5,
    "currency": "SOL",
    "category": "Digital Art",
    "stock": "unlimited"
  }'
```

## 🗄️ Database Schema

The API uses PostgreSQL with the following main entities:

- **Users**: Wallet addresses and user information
- **Stores**: Store details and settings
- **Products**: Product catalog with pricing and inventory
- **Orders**: Order processing and tracking
- **OrderItems**: Individual items within orders

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation for all inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: Helmet.js security headers
- **CORS**: Configurable cross-origin resource sharing

## 📊 Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

## 🧪 Testing

You can test the API using the provided `api.rest` file with REST Client extension in VS Code, or use tools like Postman or curl.

## 📈 Monitoring

- Health check endpoint: `GET /health`
- Development logging with Prisma query logs
- Error tracking and logging

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL=<production_database_url>
   JWT_SECRET=<secure_random_string>
   ```

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the production server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.