const hre = require("hardhat");

async function main() {
  const WordOfChoiceLife = await hre.ethers.getContractFactory("WordOfChoiceLife");
  const wordOfChoiceLife = await WordOfChoiceLife.deploy();

  await wordOfChoiceLife.waitForDeployment();

  console.log("WordOfChoiceLife deployed to:", await wordOfChoiceLife.getAddress());

  // Verify contract on BaseScan
  if (process.env.BASESCAN_API_KEY) {
    console.log("Verifying contract on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: await wordOfChoiceLife.getAddress(),
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