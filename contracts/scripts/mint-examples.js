// mint-examples.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Contract ABI (nur relevante Funktionen)
const abi = [
  "function mintExpression(bool isBest, string word) public payable",
];

// Werte aus .env
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || process.env.BASE_SEPOLIA_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x48279F9ccc5C82315553141a79FB16cC1680a196";
const MINT_PRICE = ethers.parseEther("0.001");

if (!PRIVATE_KEY || !RPC_URL) {
  console.error("Bitte PRIVATE_KEY und RPC_URL in der .env setzen!");
  process.exit(1);
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  const words = [
    "GO",      // 2 Zeichen
    "WAVE",    // 4 Zeichen
    "SPIRIT",  // 6 Zeichen
    "SUNLIGHT" // 8 Zeichen
  ];

  console.log("Minting with wallet:", wallet.address);

  const variants = words.map(word => ({ isBest: false, word }));

  for (const v of variants) {
    try {
      console.log(`Minting: ${v.isBest ? 'best' : 'worst'} + ${v.word}`);
      const tx = await contract.mintExpression(v.isBest, v.word, { value: MINT_PRICE });
      console.log('  → TX sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('  ✓ Minted! Block:', receipt.blockNumber);
      await new Promise(r => setTimeout(r, 5000)); // 5 Sekunden Pause
    } catch (e) {
      console.error('  ✗ Fehler beim Mint:', e.reason || e.message || e);
    }
  }
}

main(); 