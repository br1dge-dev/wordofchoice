const hre = require("hardhat");

async function main() {
  const WordOfChoice = await hre.ethers.getContractFactory("WordOfChoice");
  const wordOfChoice = await WordOfChoice.deploy();

  await wordOfChoice.waitForDeployment();

  console.log("WordOfChoice deployed to:", await wordOfChoice.getAddress());

  // Verify contract on BaseScan
  if (process.env.BASESCAN_API_KEY) {
    console.log("Verifying contract on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: await wordOfChoice.getAddress(),
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Error verifying contract:", error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 