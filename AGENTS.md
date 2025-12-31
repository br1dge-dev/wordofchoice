# WordOfChoice

## Overview
NFT minting platform on BASE mainnet where users can mint their own expressions as art. An onchain experiment combining art, social, and blockchain technology.

**Status:** PRODUCTION - LIVE ON BASE MAINNET  
**Contract:** `0xCE4D8d60433348A0A1ae06434873b25099Ac7d40`  
**Mint Price:** 0.0069 ETH  
**Chain:** BASE (Chain ID: 8453)

## Tech Stack
- **Blockchain:** Ethereum-compatible (BASE network)
- **Smart Contracts:** OpenZeppelin ERC721
- **Frontend:** Vanilla JavaScript with ethers.js
- **Contract Verification:** Verified on BaseScan
- **Deployment:** Manual (npm scripts) to BASE mainnet

## Code Architecture
```
wordofchoice/
├── contracts/                 # Smart contracts
│   ├── WordOfChoice.sol      # Main NFT contract
│   ├── artifacts/            # Compiled ABIs
│   └── test/                 # Contract tests
├── frontend/                 # Frontend files
│   ├── index.html
│   ├── script.js            # Web3 logic
│   └── styles.css
├── dist/                     # Built frontend assets
├── DEPLOYMENT_SUMMARY.md     # Deployment documentation
├── package.json              # Root workspace config
└── .env                      # RPC URLs, Private Keys (PROTECT!)
```

## Coding Conventions
- **Smart Contracts:** Solidity, OpenZeppelin patterns
- **Frontend:** Vanilla JS, ES6 modules
- **Environment:** .env for sensitive keys (never commit!)

## Current Focus
- Security audit recommendation
- Gas optimization opportunities
- Frontend UX improvements
- Error handling enhancement

## Common Tasks
```bash
# Setup
npm run install:all           # Install all workspaces

# Smart Contracts
cd contracts && npm install
npm run compile               # Compile with Hardhat
npm run test                  # Run test suite
npm run deploy:base           # Deploy to BASE mainnet
npm run deploy:sepolia        # Deploy to Base Sepolia

# Frontend
cd frontend && npm run build  # Build static assets
```

## Key Files
- `contracts/WordOfChoice.sol` - Main NFT smart contract
- `frontend/script.js` - Web3 connection & minting logic
- `DEPLOYMENT_SUMMARY.md` - Full deployment history

## 🚨 CRITICAL NOTES
**LIVE DEPLOYMENT - REAL MONEY INVOLVED**
- Any changes must be thoroughly tested
- Consider proxy patterns for upgrades
- Backup current contract before modifications
- Document all changes for transparency
- Never commit .env with private keys!

## Environment Variables Required
```
BASE_RPC_URL=              # BASE mainnet RPC
PRIVATE_KEY=               # Deployer wallet (NEVER commit!)
ETHERSCAN_API_KEY=         # For contract verification
```

## Recent History (check with `git log --oneline -5`)
- Check deployment history in DEPLOYMENT_SUMMARY.md
