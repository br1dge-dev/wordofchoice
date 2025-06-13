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
const MINT_PRICE = ethers.parseEther("0.01");

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

// Test-SVG für 'TOMORROW' (Toggle: Best)
async function createTomorrowSVG() {
  const { ethers } = require('ethers');
  const abi = [
    "function tokenURI(uint256 tokenId) public view returns (string)"
  ];
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || process.env.BASE_SEPOLIA_RPC_URL);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, provider);
  // Simuliere Token mit Toggle: Best, Word: TOMORROW
  // Da der Contract onchain generiert, kann man das SVG aus tokenURI extrahieren
  // Alternativ: SVG-String direkt aus _generateSVG nachbauen (hier: manuell)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><defs><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.12"/></feComponentTransfer></filter></defs><rect width="500" height="500" fill="#F5E9D4"/><rect x="24" y="24" width="100" height="40" rx="11" fill="#2C241B"/><text x="74" y="48" font-size="28" fill="#F5E9D4" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">#1</text><text x="250" y="220" font-size="40" fill="#2C241B" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">The best thing in</text><g><text x="130" y="312" font-size="40" fill="#2C241B" font-family="Arial, sans-serif" font-weight="bold" text-anchor="end"><tspan font-weight="bold" text-decoration="underline">life</tspan> is</text><rect x="135" y="266" width="350" height="64" rx="11" fill="#2C241B"/><text x="310" y="298" font-size="56" fill="#F5E9D4" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">TOMORROW</text></g><rect width="500" height="500" filter="url(#grain)" fill="#000" fill-opacity="0" style="pointer-events:none"/></svg>`;
  fs.writeFileSync("tomorrow-kleiner.svg", svg);
}
createTomorrowSVG();

main(); 