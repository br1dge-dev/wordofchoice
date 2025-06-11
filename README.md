# Word of Choice

An art, social, and onchain experiment where users can mint their own expressions as NFTs.

## Project Structure

```
wordofchoice/
├── frontend/                 # Frontend Application
│   ├── src/                 # Source Code
│   │   ├── components/      # React Components
│   │   ├── hooks/          # Custom React Hooks
│   │   ├── utils/          # Utility Functions
│   │   ├── styles/         # CSS/SCSS Files
│   │   └── assets/         # Images, Icons etc.
│   ├── public/             # Static Files
│   └── package.json        # Frontend Dependencies
│
├── contracts/              # Smart Contracts
│   ├── src/               # Solidity Source Code
│   │   └── WordOfChoice.sol
│   ├── test/              # Contract Tests
│   ├── scripts/           # Deployment Scripts
│   └── hardhat.config.js  # Hardhat Configuration
│
├── .gitignore
└── README.md
```

## Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Smart Contracts
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

## Technologies

- Frontend: React, Web3.js/Ethers.js
- Smart Contracts: Solidity, Hardhat
- Blockchain: BASE Chain 