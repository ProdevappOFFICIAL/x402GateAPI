# Tech Stack

## Core Technologies
- **Runtime**: Node.js with TypeScript (ES6 target, CommonJS modules)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Solana (@solana/web3.js, @solana/pay, @solana/spl-token)

## Key Libraries
- **Security**: helmet, cors, express-rate-limit, bcryptjs, jsonwebtoken
- **Validation**: joi
- **File Upload**: multer, uploadthing
- **Utilities**: dotenv, bignumber.js

## Build System
- **Compiler**: TypeScript with strict mode enabled
- **Dev Server**: nodemon with ts-node
- **Output**: `./dist` directory

## Common Commands

### Development
```bash
npm run dev          # Start dev server with nodemon
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled production build
```

### Database
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes without migration
npm run db:migrate   # Create and run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio GUI
```

## TypeScript Configuration
- Strict mode enabled
- Source: `./src`
- Output: `./dist`
- Module resolution: Node
- ES module interop enabled
