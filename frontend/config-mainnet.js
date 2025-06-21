// BASE Mainnet Configuration for Word of Choice
// Replace CONTRACT_ADDRESS with your deployed contract address

const MAINNET_CONFIG = {
  // Contract Configuration
  CONTRACT_ADDRESS: "0x...", // TODO: Replace with deployed contract address
  NETWORK_ID: 8453, // BASE Mainnet
  NETWORK_NAME: "BASE Mainnet",
  
  // RPC Configuration
  RPC_URLS: {
    primary: "https://mainnet.base.org",
    // Alternative RPC providers for better performance:
    // alchemy: "https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
    // infura: "https://base-mainnet.infura.io/v3/YOUR_API_KEY",
    // blockpi: "https://base.blockpi.network/v1/rpc/public"
  },
  
  // Explorer Configuration
  EXPLORER_URL: "https://basescan.org",
  
  // Contract ABI (minimal for frontend)
  CONTRACT_ABI: [
    "function express(bool isBest, string memory word) external payable",
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    "function nextTokenId() public view returns (uint256)",
    "function mintPrice() public view returns (uint256)",
    "function owner() public view returns (address)",
    "function exists(uint256 tokenId) public view returns (bool)",
    "event ExpressionMinted(address indexed minter, uint256 indexed tokenId, bool isBest, string word, uint256 timestamp)"
  ],
  
  // Mint Configuration
  MINT_PRICE: "0.0069", // ETH
  MAX_WORD_LENGTH: 8,
  ALLOWED_CHARS: /^[A-Z]+$/, // Only uppercase letters
  
  // UI Configuration
  UI_CONFIG: {
    title: "word of CHOICE (life)",
    description: "Feel your mood, choose a word and mint your statement. Nicely numbered. An interactive, minimalistic EXPERIMENT, full of expressions.",
    maxGasLimit: 300000, // Gas limit for mint transactions
    confirmations: 3, // Block confirmations to wait for
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    INSUFFICIENT_BALANCE: "Insufficient balance for minting",
    INVALID_WORD: "Word must be 1-8 uppercase letters only",
    WORD_ALREADY_USED: "This word has already been used",
    NETWORK_ERROR: "Please connect to BASE Mainnet",
    TRANSACTION_FAILED: "Transaction failed. Please try again.",
    USER_REJECTED: "Transaction was rejected by user"
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    MINT_SUCCESS: "NFT minted successfully!",
    CONNECTION_SUCCESS: "Connected to BASE Mainnet"
  }
};

// Network detection helper
const NETWORK_CONFIGS = {
  8453: {
    name: "BASE Mainnet",
    rpcUrl: MAINNET_CONFIG.RPC_URLS.primary,
    explorer: MAINNET_CONFIG.EXPLORER_URL,
    chainId: "0x2105", // Hex chain ID for MetaMask
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    }
  },
  84532: {
    name: "BASE Sepolia Testnet",
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    chainId: "0x14a34", // Hex chain ID for MetaMask
    currency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    }
  }
};

// Helper functions
const CONFIG_HELPERS = {
  // Get network config by chain ID
  getNetworkConfig: (chainId) => {
    return NETWORK_CONFIGS[chainId] || null;
  },
  
  // Check if connected to correct network
  isCorrectNetwork: (chainId) => {
    return chainId === MAINNET_CONFIG.NETWORK_ID;
  },
  
  // Format price for display
  formatPrice: (price) => {
    return `${price} ETH`;
  },
  
  // Validate word input
  validateWord: (word) => {
    if (!word || word.length === 0 || word.length > MAINNET_CONFIG.MAX_WORD_LENGTH) {
      return { valid: false, error: "Word must be 1-8 characters long" };
    }
    if (!MAINNET_CONFIG.ALLOWED_CHARS.test(word)) {
      return { valid: false, error: "Word must contain only uppercase letters A-Z" };
    }
    return { valid: true };
  },
  
  // Get transaction explorer URL
  getTransactionUrl: (txHash) => {
    return `${MAINNET_CONFIG.EXPLORER_URL}/tx/${txHash}`;
  },
  
  // Get token explorer URL
  getTokenUrl: (tokenId) => {
    return `${MAINNET_CONFIG.EXPLORER_URL}/token/${MAINNET_CONFIG.CONTRACT_ADDRESS}?a=${tokenId}`;
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MAINNET_CONFIG, NETWORK_CONFIGS, CONFIG_HELPERS };
} else {
  window.MAINNET_CONFIG = MAINNET_CONFIG;
  window.NETWORK_CONFIGS = NETWORK_CONFIGS;
  window.CONFIG_HELPERS = CONFIG_HELPERS;
} 