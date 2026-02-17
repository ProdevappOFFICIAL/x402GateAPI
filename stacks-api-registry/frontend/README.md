# API Registry Frontend

A React + Vite + TypeScript + Tailwind CSS application for managing API configurations on the Stacks blockchain.

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Update the contract address in `src/utils/stacks.ts`:
   - Replace `contractAddress` with your deployed contract address
   - Replace `contractName` with your contract name (default: 'api-registry')

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Features

- Connect Stacks wallet (Hiro Wallet, Xverse, etc.)
- Create new API configurations
- Update existing API configurations
- Delete API configurations
- Form fields:
  - API Name
  - Allowed Agent Wallets (comma-separated)
  - Cooldown (in blocks)
  - Verify Agent (toggle switch)

## Smart Contract Integration

The app interacts with the `api-registry.clar` smart contract deployed on Stacks testnet.

Make sure to:
1. Deploy your contract using Clarinet
2. Update the contract address in the code
3. Have testnet STX in your wallet for transactions
