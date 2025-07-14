const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Contract verification script for Etherscan
 * Verifies all deployed contracts with their constructor arguments
 */
async function main() {
  console.log("=".repeat(60));
  console.log("Private Taxi Dispatch - Contract Verification");
  console.log("=".repeat(60));
  console.log();

  const network = hre.network.name;

  // Check if we have Etherscan API key
  if (!process.env.ETHERSCAN_API_KEY) {
    console.error("ERROR: ETHERSCAN_API_KEY not set in .env file");
    console.error("Please add your Etherscan API key to continue.");
    process.exit(1);
  }

  // Load deployment data
  const deploymentsDir = path.join(__dirname, "..", "deployments", network);
  const deploymentFile = path.join(deploymentsDir, "deployment.json");

  if (!fs.existsSync(deploymentFile)) {
    console.error(`ERROR: Deployment file not found at ${deploymentFile}`);
    console.error("Please deploy contracts first using: npm run deploy:sepolia");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contracts = deploymentData.contracts;

  console.log(`Network: ${network}`);
  console.log(`Chain ID: ${deploymentData.chainId}`);
  console.log();

  try {
    // Get pauser addresses (should match deployment)
    const [deployer] = await hre.ethers.getSigners();
    const pauser1 = (process.env.PAUSER1_ADDRESS && process.env.PAUSER1_ADDRESS !== '0x0000000000000000000000000000000000000000')
      ? process.env.PAUSER1_ADDRESS
      : deployer.address;
    const pauser2 = (process.env.PAUSER2_ADDRESS && process.env.PAUSER2_ADDRESS !== '0x0000000000000000000000000000000000000000')
      ? process.env.PAUSER2_ADDRESS
      : deployer.address;

    // Create pausers array (remove duplicates)
    const pausersArray = pauser1 === pauser2 ? [pauser1] : [pauser1, pauser2];

    // Verify PauserSet
    if (contracts.PauserSet) {
      console.log("Verifying PauserSet...");
      console.log("-".repeat(60));
      console.log(`Contract: ${contracts.PauserSet}`);
      console.log(`Pausers: ${pausersArray.join(', ')}`);

      try {
        await hre.run("verify:verify", {
          address: contracts.PauserSet,
          constructorArguments: [pausersArray],
        });
        console.log("✓ PauserSet verified successfully");
      } catch (error) {
        if (error.message.includes("Already Verified")) {
          console.log("✓ PauserSet already verified");
        } else {
          console.error("✗ PauserSet verification failed:", error.message);
        }
      }
      console.log();
    }

    // Verify TaxiGateway
    if (contracts.TaxiGateway) {
      console.log("Verifying TaxiGateway...");
      console.log("-".repeat(60));
      console.log(`Contract: ${contracts.TaxiGateway}`);

      const kmsGenerationAddress = (process.env.KMS_GENERATION_ADDRESS && process.env.KMS_GENERATION_ADDRESS !== '0x0000000000000000000000000000000000000000')
        ? process.env.KMS_GENERATION_ADDRESS
        : deployer.address;

      try {
        await hre.run("verify:verify", {
          address: contracts.TaxiGateway,
          constructorArguments: [contracts.PauserSet, kmsGenerationAddress],
        });
        console.log("✓ TaxiGateway verified successfully");
      } catch (error) {
        if (error.message.includes("Already Verified")) {
          console.log("✓ TaxiGateway already verified");
        } else {
          console.error("✗ TaxiGateway verification failed:", error.message);
        }
      }
      console.log();
    }

    // Verify PrivateTaxiDispatch
    if (contracts.PrivateTaxiDispatch) {
      console.log("Verifying PrivateTaxiDispatch...");
      console.log("-".repeat(60));
      console.log(`Contract: ${contracts.PrivateTaxiDispatch}`);

      try {
        await hre.run("verify:verify", {
          address: contracts.PrivateTaxiDispatch,
          constructorArguments: [contracts.TaxiGateway],
        });
        console.log("✓ PrivateTaxiDispatch verified successfully");
      } catch (error) {
        if (error.message.includes("Already Verified")) {
          console.log("✓ PrivateTaxiDispatch already verified");
        } else {
          console.error("✗ PrivateTaxiDispatch verification failed:", error.message);
        }
      }
      console.log();
    }

    // Print Etherscan links
    console.log("=".repeat(60));
    console.log("Verification Complete");
    console.log("=".repeat(60));
    console.log();
    console.log("View on Etherscan:");

    const explorerUrl = network === "sepolia"
      ? "https://sepolia.etherscan.io/address/"
      : "https://etherscan.io/address/";

    if (contracts.PauserSet) {
      console.log(`  PauserSet:            ${explorerUrl}${contracts.PauserSet}#code`);
    }
    if (contracts.TaxiGateway) {
      console.log(`  TaxiGateway:          ${explorerUrl}${contracts.TaxiGateway}#code`);
    }
    if (contracts.PrivateTaxiDispatch) {
      console.log(`  PrivateTaxiDispatch:  ${explorerUrl}${contracts.PrivateTaxiDispatch}#code`);
    }
    console.log();
    console.log("=".repeat(60));

  } catch (error) {
    console.error();
    console.error("Verification failed:");
    console.error(error);
    process.exit(1);
  }
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
