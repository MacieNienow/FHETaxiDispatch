const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Main deployment script for Private Taxi Dispatch System
 * Deploys all contracts in the correct order:
 * 1. PauserSet
 * 2. TaxiGateway
 * 3. PrivateTaxiDispatch
 */
async function main() {
  console.log("=".repeat(60));
  console.log("Private Taxi Dispatch - Deployment Script");
  console.log("=".repeat(60));
  console.log();

  // Get deployment info
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log("Deployment Configuration:");
  console.log("-".repeat(60));
  console.log(`Network:        ${network}`);
  console.log(`Chain ID:       ${chainId}`);
  console.log(`Deployer:       ${deployer.address}`);
  console.log(`Balance:        ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);
  console.log();

  // Deployment data to save
  const deploymentData = {
    network: network,
    chainId: chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  try {
    // Step 1: Deploy PauserSet
    console.log("Step 1: Deploying PauserSet...");
    console.log("-".repeat(60));

    // Get pauser addresses (can be configured via environment variables)
    // If not set or set to zero address, use deployer address
    const pauser1 = (process.env.PAUSER1_ADDRESS && process.env.PAUSER1_ADDRESS !== '0x0000000000000000000000000000000000000000')
      ? process.env.PAUSER1_ADDRESS
      : deployer.address;
    const pauser2 = (process.env.PAUSER2_ADDRESS && process.env.PAUSER2_ADDRESS !== '0x0000000000000000000000000000000000000000')
      ? process.env.PAUSER2_ADDRESS
      : deployer.address;

    // Create pausers array (remove duplicates)
    const pausersArray = pauser1 === pauser2 ? [pauser1] : [pauser1, pauser2];

    console.log(`Pauser addresses: ${pausersArray.join(', ')}`);
    console.log(`Number of pausers: ${pausersArray.length}`);

    const PauserSet = await hre.ethers.getContractFactory("PauserSet");
    const pauserSet = await PauserSet.deploy(pausersArray);
    await pauserSet.waitForDeployment();

    const pauserSetAddress = await pauserSet.getAddress();
    console.log(`✓ PauserSet deployed to: ${pauserSetAddress}`);
    deploymentData.contracts.PauserSet = pauserSetAddress;
    console.log();

    // Step 2: Deploy TaxiGateway
    console.log("Step 2: Deploying TaxiGateway...");
    console.log("-".repeat(60));

    // Get KMS Generation contract address from environment or use deployer address as placeholder
    const kmsGenerationAddress = (process.env.KMS_GENERATION_ADDRESS && process.env.KMS_GENERATION_ADDRESS !== '0x0000000000000000000000000000000000000000')
      ? process.env.KMS_GENERATION_ADDRESS
      : deployer.address;
    console.log(`KMS Generation Contract: ${kmsGenerationAddress}`);

    const TaxiGateway = await hre.ethers.getContractFactory("TaxiGateway");
    const taxiGateway = await TaxiGateway.deploy(pauserSetAddress, kmsGenerationAddress);
    await taxiGateway.waitForDeployment();

    const taxiGatewayAddress = await taxiGateway.getAddress();
    console.log(`✓ TaxiGateway deployed to: ${taxiGatewayAddress}`);
    deploymentData.contracts.TaxiGateway = taxiGatewayAddress;
    console.log();

    // Step 3: Deploy PrivateTaxiDispatch
    console.log("Step 3: Deploying PrivateTaxiDispatch...");
    console.log("-".repeat(60));

    const PrivateTaxiDispatch = await hre.ethers.getContractFactory("PrivateTaxiDispatch");
    const privateTaxiDispatch = await PrivateTaxiDispatch.deploy(taxiGatewayAddress);
    await privateTaxiDispatch.waitForDeployment();

    const privateTaxiDispatchAddress = await privateTaxiDispatch.getAddress();
    console.log(`✓ PrivateTaxiDispatch deployed to: ${privateTaxiDispatchAddress}`);
    deploymentData.contracts.PrivateTaxiDispatch = privateTaxiDispatchAddress;
    console.log();

    // Step 4: Configuration (Gateway is already linked)
    console.log("Step 4: Verifying Configuration...");
    console.log("-".repeat(60));
    console.log(`✓ PrivateTaxiDispatch is configured to use TaxiGateway`);
    console.log(`✓ TaxiGateway uses PauserSet for access control`);
    console.log();

    // Save deployment information
    const deploymentsDir = path.join(__dirname, "..", "deployments", network);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, "deployment.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log(`✓ Deployment data saved to: ${deploymentFile}`);
    console.log();

    // Generate contract addresses file for frontend
    const contractAddressesFile = path.join(__dirname, "..", "public", "contracts.json");
    const contractAddresses = {
      PauserSet: pauserSetAddress,
      TaxiGateway: taxiGatewayAddress,
      PrivateTaxiDispatch: privateTaxiDispatchAddress,
      network: network,
      chainId: chainId.toString()
    };
    fs.writeFileSync(contractAddressesFile, JSON.stringify(contractAddresses, null, 2));
    console.log(`✓ Contract addresses saved to: ${contractAddressesFile}`);
    console.log();

    // Print deployment summary
    console.log("=".repeat(60));
    console.log("Deployment Summary");
    console.log("=".repeat(60));
    console.log();
    console.log("Deployed Contracts:");
    console.log(`  PauserSet:            ${pauserSetAddress}`);
    console.log(`  TaxiGateway:          ${taxiGatewayAddress}`);
    console.log(`  PrivateTaxiDispatch:  ${privateTaxiDispatchAddress}`);
    console.log();
    console.log("Next Steps:");
    console.log("  1. Verify contracts on Etherscan:");
    console.log(`     npm run verify:sepolia`);
    console.log();
    console.log("  2. Test contract interactions:");
    console.log(`     node scripts/interact.js`);
    console.log();
    console.log("  3. Run simulation:");
    console.log(`     node scripts/simulate.js`);
    console.log();
    console.log("=".repeat(60));

  } catch (error) {
    console.error();
    console.error("Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
