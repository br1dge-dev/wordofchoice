const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting BASE Mainnet Deployment...");
  
  // Pre-deployment checks
  console.log("\n📋 Pre-deployment checks:");
  
  // Check if we're on the right network
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 8453n) {
    throw new Error("❌ Not on BASE Mainnet! Chain ID: " + network.chainId);
  }
  console.log("✅ Network: BASE Mainnet (Chain ID: 8453)");
  
  // Check deployer balance
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("✅ Deployer:", deployer.address);
  console.log("✅ Balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance < hre.ethers.parseEther("0.05")) {
    throw new Error("❌ Insufficient balance for deployment. Need at least 0.05 ETH");
  }
  
  // Deploy contract
  console.log("\n🔨 Deploying WordOfChoiceLife contract...");
  const WordOfChoiceLife = await hre.ethers.getContractFactory("WordOfChoiceLife");
  const wordOfChoiceLife = await WordOfChoiceLife.deploy();
  
  console.log("⏳ Waiting for deployment confirmation...");
  await wordOfChoiceLife.waitForDeployment();
  
  const contractAddress = await wordOfChoiceLife.getAddress();
  console.log("✅ Contract deployed to:", contractAddress);
  
  // Wait a few blocks for confirmation
  console.log("⏳ Waiting for 3 block confirmations...");
  await wordOfChoiceLife.deploymentTransaction().wait(3);
  
  // Verify contract on BaseScan
  if (process.env.BASESCAN_API_KEY) {
    console.log("\n🔍 Verifying contract on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully on BaseScan");
    } catch (error) {
      console.log("⚠️ Error verifying contract:", error.message);
    }
  } else {
    console.log("⚠️ BASESCAN_API_KEY not set, skipping verification");
  }
  
  // Post-deployment tests
  console.log("\n🧪 Running post-deployment tests...");
  
  // Test 1: Check contract owner
  const owner = await wordOfChoiceLife.owner();
  console.log("✅ Contract owner:", owner);
  console.log("✅ Expected owner:", deployer.address);
  
  // Test 2: Check initial state
  const nextTokenId = await wordOfChoiceLife.nextTokenId();
  const mintPrice = await wordOfChoiceLife.mintPrice();
  console.log("✅ Next token ID:", nextTokenId.toString());
  console.log("✅ Mint price:", hre.ethers.formatEther(mintPrice), "ETH");
  
  // Test 3: Mint first NFT
  console.log("\n🎨 Minting first test NFT...");
  try {
    const mintTx = await wordOfChoiceLife.express(true, "FIRST", {
      value: mintPrice
    });
    console.log("⏳ Waiting for mint transaction...");
    await mintTx.wait();
    
    // Check if NFT was minted
    const tokenURI = await wordOfChoiceLife.tokenURI(1);
    console.log("✅ First NFT minted successfully!");
    console.log("✅ Token URI length:", tokenURI.length);
    
    // Decode and check token URI
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const jsonData = JSON.parse(Buffer.from(tokenURI.slice(29), 'base64').toString());
      console.log("✅ Token name:", jsonData.name);
      console.log("✅ Token attributes:", jsonData.attributes.length, "attributes");
    }
    
  } catch (error) {
    console.log("❌ Error minting first NFT:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: "BASE Mainnet",
    chainId: network.chainId.toString(),
    deploymentTime: new Date().toISOString(),
    baseScanUrl: `https://basescan.org/address/${contractAddress}`,
    firstTokenId: "1",
    mintPrice: hre.ethers.formatEther(mintPrice) + " ETH"
  };
  
  const deploymentPath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📄 Deployment info saved to:", deploymentPath);
  
  // Final summary
  console.log("\n🎉 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Contract Address:", contractAddress);
  console.log("BaseScan URL:", deploymentInfo.baseScanUrl);
  console.log("Deployer:", deployer.address);
  console.log("Network:", deploymentInfo.network);
  console.log("Mint Price:", deploymentInfo.mintPrice);
  console.log("=".repeat(50));
  
  console.log("\n🔗 Next steps:");
  console.log("1. Update frontend with contract address");
  console.log("2. Test frontend integration");
  console.log("3. Announce launch on social media");
  console.log("4. Monitor contract activity");
  
  return deploymentInfo;
}

main()
  .then((deploymentInfo) => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exitCode = 1;
  }); 