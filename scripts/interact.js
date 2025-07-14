const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Interactive script for Private Taxi Dispatch System
 * Provides functions to interact with deployed contracts
 */

let privateTaxiDispatch;
let taxiGateway;
let pauserSet;

/**
 * Load deployed contract instances
 */
async function loadContracts() {
  const network = hre.network.name;
  const deploymentsDir = path.join(__dirname, "..", "deployments", network);
  const deploymentFile = path.join(deploymentsDir, "deployment.json");

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found at ${deploymentFile}`);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contracts = deploymentData.contracts;

  // Load contract instances
  privateTaxiDispatch = await hre.ethers.getContractAt(
    "PrivateTaxiDispatch",
    contracts.PrivateTaxiDispatch
  );

  taxiGateway = await hre.ethers.getContractAt(
    "TaxiGateway",
    contracts.TaxiGateway
  );

  pauserSet = await hre.ethers.getContractAt(
    "PauserSet",
    contracts.PauserSet
  );

  return { privateTaxiDispatch, taxiGateway, pauserSet };
}

/**
 * Display contract information
 */
async function displayContractInfo() {
  console.log("Contract Information:");
  console.log("-".repeat(60));
  console.log(`PrivateTaxiDispatch: ${await privateTaxiDispatch.getAddress()}`);
  console.log(`TaxiGateway:         ${await taxiGateway.getAddress()}`);
  console.log(`PauserSet:           ${await pauserSet.getAddress()}`);
  console.log();

  // Get contract state
  const dispatcher = await privateTaxiDispatch.dispatcher();
  const requestCounter = await privateTaxiDispatch.requestCounter();
  const driverCounter = await privateTaxiDispatch.driverCounter();
  const isPaused = await taxiGateway.paused();

  console.log("Contract State:");
  console.log("-".repeat(60));
  console.log(`Dispatcher:      ${dispatcher}`);
  console.log(`Request Counter: ${requestCounter}`);
  console.log(`Driver Counter:  ${driverCounter}`);
  console.log(`System Paused:   ${isPaused}`);
  console.log();
}

/**
 * Register a driver
 */
async function registerDriver(driverSigner) {
  console.log("Registering Driver...");
  console.log("-".repeat(60));
  console.log(`Driver Address: ${driverSigner.address}`);

  try {
    const tx = await privateTaxiDispatch.connect(driverSigner).registerDriver();
    const receipt = await tx.wait();

    console.log(`✓ Driver registered successfully`);
    console.log(`  Transaction: ${receipt.hash}`);
    console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
    console.log();

    return receipt;
  } catch (error) {
    console.error("✗ Driver registration failed:", error.message);
    throw error;
  }
}

/**
 * Get driver information
 */
async function getDriverInfo(driverAddress) {
  console.log("Fetching Driver Information...");
  console.log("-".repeat(60));
  console.log(`Driver Address: ${driverAddress}`);

  try {
    const driverInfo = await privateTaxiDispatch.getDriverInfo(driverAddress);

    console.log(`Driver Information:`);
    console.log(`  Is Registered: ${driverInfo.isRegistered}`);
    console.log(`  Is Available:  ${driverInfo.isAvailable}`);
    console.log(`  Total Rides:   ${driverInfo.totalRides}`);
    console.log(`  Registration:  ${new Date(Number(driverInfo.registrationTime) * 1000).toLocaleString()}`);
    console.log();

    return driverInfo;
  } catch (error) {
    console.error("✗ Failed to fetch driver info:", error.message);
    throw error;
  }
}

/**
 * Request a ride
 */
async function requestRide(passengerSigner, pickupLat, pickupLong, destLat, destLong, maxFare) {
  console.log("Creating Ride Request...");
  console.log("-".repeat(60));
  console.log(`Passenger:   ${passengerSigner.address}`);
  console.log(`Pickup:      Lat ${pickupLat}, Long ${pickupLong}`);
  console.log(`Destination: Lat ${destLat}, Long ${destLong}`);
  console.log(`Max Fare:    ${maxFare}`);

  try {
    // Note: In production, these values should be encrypted using FHE
    // For testing, we're using plain values
    const tx = await privateTaxiDispatch.connect(passengerSigner).requestRide(
      pickupLat,
      pickupLong,
      destLat,
      destLong,
      maxFare
    );
    const receipt = await tx.wait();

    // Get request ID from events
    const requestId = receipt.logs.length > 0
      ? receipt.logs[0].topics[1]
      : "Unknown";

    console.log(`✓ Ride requested successfully`);
    console.log(`  Request ID:   ${requestId}`);
    console.log(`  Transaction:  ${receipt.hash}`);
    console.log(`  Gas Used:     ${receipt.gasUsed.toString()}`);
    console.log();

    return { receipt, requestId };
  } catch (error) {
    console.error("✗ Ride request failed:", error.message);
    throw error;
  }
}

/**
 * Get ride request information
 */
async function getRideRequestInfo(requestId) {
  console.log("Fetching Ride Request...");
  console.log("-".repeat(60));
  console.log(`Request ID: ${requestId}`);

  try {
    const requestInfo = await privateTaxiDispatch.getRideRequest(requestId);

    console.log(`Ride Request Information:`);
    console.log(`  Passenger:       ${requestInfo.passenger}`);
    console.log(`  Assigned Driver: ${requestInfo.assignedDriver}`);
    console.log(`  Is Completed:    ${requestInfo.isCompleted}`);
    console.log(`  Is Cancelled:    ${requestInfo.isCancelled}`);
    console.log(`  Request Time:    ${new Date(Number(requestInfo.requestTime) * 1000).toLocaleString()}`);
    console.log();

    return requestInfo;
  } catch (error) {
    console.error("✗ Failed to fetch ride request:", error.message);
    throw error;
  }
}

/**
 * Check gateway pause status
 */
async function checkPauseStatus() {
  const isPaused = await taxiGateway.paused();
  console.log(`Gateway Pause Status: ${isPaused ? "PAUSED" : "ACTIVE"}`);
  console.log();
  return isPaused;
}

/**
 * Main interactive menu
 */
async function main() {
  console.log("=".repeat(60));
  console.log("Private Taxi Dispatch - Contract Interaction");
  console.log("=".repeat(60));
  console.log();

  const network = hre.network.name;
  console.log(`Network: ${network}`);
  console.log();

  try {
    // Load contracts
    console.log("Loading contracts...");
    await loadContracts();
    console.log("✓ Contracts loaded successfully");
    console.log();

    // Display contract info
    await displayContractInfo();

    // Get signers
    const [deployer, driver1, passenger1] = await hre.ethers.getSigners();

    console.log("Available Accounts:");
    console.log("-".repeat(60));
    console.log(`Deployer:   ${deployer.address}`);
    console.log(`Driver 1:   ${driver1.address}`);
    console.log(`Passenger 1: ${passenger1.address}`);
    console.log();

    // Check pause status
    await checkPauseStatus();

    // Example interactions (commented out by default)
    console.log("Example Interactions (uncomment to run):");
    console.log("-".repeat(60));
    console.log("// Register a driver:");
    console.log("// await registerDriver(driver1);");
    console.log();
    console.log("// Get driver information:");
    console.log("// await getDriverInfo(driver1.address);");
    console.log();
    console.log("// Request a ride:");
    console.log("// await requestRide(passenger1, 40.7128, -74.0060, 40.7589, -73.9851, 5000);");
    console.log();

    // Uncomment below to run example interactions
    /*
    // Register driver
    await registerDriver(driver1);
    await getDriverInfo(driver1.address);

    // Request ride
    const { requestId } = await requestRide(
      passenger1,
      40712800, // Pickup latitude (NYC)
      -74006000, // Pickup longitude
      40758900, // Destination latitude (Times Square)
      -73985100, // Destination longitude
      5000 // Max fare (in smallest unit)
    );

    // Get ride request info
    await getRideRequestInfo(requestId);
    */

    console.log("=".repeat(60));
    console.log("Interaction Script Complete");
    console.log("=".repeat(60));

  } catch (error) {
    console.error();
    console.error("Interaction failed:");
    console.error(error);
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  loadContracts,
  displayContractInfo,
  registerDriver,
  getDriverInfo,
  requestRide,
  getRideRequestInfo,
  checkPauseStatus,
};

// Execute if run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
