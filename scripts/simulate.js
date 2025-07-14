const hre = require("hardhat");
const {
  loadContracts,
  displayContractInfo,
  registerDriver,
  getDriverInfo,
  requestRide,
  getRideRequestInfo,
  checkPauseStatus,
} = require("./interact");

/**
 * Simulation script for Private Taxi Dispatch System
 * Simulates a complete ride-sharing workflow with multiple drivers and passengers
 */

/**
 * Sleep utility function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulate driver registration
 */
async function simulateDriverRegistration(drivers) {
  console.log("=".repeat(60));
  console.log("Simulation Step 1: Driver Registration");
  console.log("=".repeat(60));
  console.log();

  const registeredDrivers = [];

  for (let i = 0; i < drivers.length; i++) {
    console.log(`Registering Driver ${i + 1}...`);
    try {
      await registerDriver(drivers[i]);
      registeredDrivers.push(drivers[i]);
      await sleep(1000); // Wait 1 second between registrations
    } catch (error) {
      console.error(`Failed to register driver ${i + 1}:`, error.message);
    }
  }

  console.log(`✓ Successfully registered ${registeredDrivers.length} drivers`);
  console.log();
  return registeredDrivers;
}

/**
 * Simulate ride requests
 */
async function simulateRideRequests(passengers, rideData) {
  console.log("=".repeat(60));
  console.log("Simulation Step 2: Ride Requests");
  console.log("=".repeat(60));
  console.log();

  const requestIds = [];

  for (let i = 0; i < passengers.length && i < rideData.length; i++) {
    const passenger = passengers[i];
    const ride = rideData[i];

    console.log(`Passenger ${i + 1} requesting ride...`);
    try {
      const { requestId } = await requestRide(
        passenger,
        ride.pickupLat,
        ride.pickupLong,
        ride.destLat,
        ride.destLong,
        ride.maxFare
      );
      requestIds.push(requestId);
      await sleep(1500); // Wait 1.5 seconds between requests
    } catch (error) {
      console.error(`Failed to create ride request ${i + 1}:`, error.message);
    }
  }

  console.log(`✓ Successfully created ${requestIds.length} ride requests`);
  console.log();
  return requestIds;
}

/**
 * Display simulation statistics
 */
async function displayStatistics(contracts) {
  console.log("=".repeat(60));
  console.log("Simulation Statistics");
  console.log("=".repeat(60));
  console.log();

  try {
    const requestCounter = await contracts.privateTaxiDispatch.requestCounter();
    const driverCounter = await contracts.privateTaxiDispatch.driverCounter();

    console.log("System Statistics:");
    console.log("-".repeat(60));
    console.log(`Total Drivers:   ${driverCounter}`);
    console.log(`Total Requests:  ${requestCounter}`);
    console.log();

    // Get detailed info for each driver
    const [deployer, driver1, driver2, driver3] = await hre.ethers.getSigners();
    const driverAddresses = [driver1.address, driver2.address, driver3.address];

    console.log("Driver Details:");
    console.log("-".repeat(60));
    for (let i = 0; i < driverAddresses.length; i++) {
      try {
        const info = await contracts.privateTaxiDispatch.getDriverInfo(driverAddresses[i]);
        if (info.isRegistered) {
          console.log(`Driver ${i + 1} (${driverAddresses[i]}):`);
          console.log(`  Registered:  ${info.isRegistered}`);
          console.log(`  Available:   ${info.isAvailable}`);
          console.log(`  Total Rides: ${info.totalRides}`);
          console.log();
        }
      } catch (error) {
        // Driver not registered, skip
      }
    }

  } catch (error) {
    console.error("Failed to fetch statistics:", error.message);
  }
}

/**
 * Main simulation function
 */
async function main() {
  console.log("=".repeat(60));
  console.log("Private Taxi Dispatch - Full System Simulation");
  console.log("=".repeat(60));
  console.log();

  const network = hre.network.name;
  console.log(`Network: ${network}`);
  console.log(`Timestamp: ${new Date().toLocaleString()}`);
  console.log();

  try {
    // Load contracts
    console.log("Loading contracts...");
    const contracts = await loadContracts();
    console.log("✓ Contracts loaded successfully");
    console.log();

    // Display initial contract info
    await displayContractInfo();

    // Check if system is paused
    const isPaused = await checkPauseStatus();
    if (isPaused) {
      console.error("✗ System is paused. Cannot proceed with simulation.");
      console.error("Please unpause the system first.");
      process.exit(1);
    }

    // Get signers (accounts)
    const [deployer, driver1, driver2, driver3, passenger1, passenger2, passenger3] = await hre.ethers.getSigners();

    console.log("Simulation Participants:");
    console.log("-".repeat(60));
    console.log(`Deployer:    ${deployer.address}`);
    console.log(`Driver 1:    ${driver1.address}`);
    console.log(`Driver 2:    ${driver2.address}`);
    console.log(`Driver 3:    ${driver3.address}`);
    console.log(`Passenger 1: ${passenger1.address}`);
    console.log(`Passenger 2: ${passenger2.address}`);
    console.log(`Passenger 3: ${passenger3.address}`);
    console.log();

    await sleep(2000);

    // Step 1: Register drivers
    const drivers = [driver1, driver2, driver3];
    const registeredDrivers = await simulateDriverRegistration(drivers);

    await sleep(2000);

    // Step 2: Create ride requests
    const passengers = [passenger1, passenger2, passenger3];
    const rideData = [
      {
        pickupLat: 40712800,    // NYC - Lower Manhattan
        pickupLong: -74006000,
        destLat: 40758900,      // Times Square
        destLong: -73985100,
        maxFare: 5000,
        description: "Lower Manhattan → Times Square"
      },
      {
        pickupLat: 40748800,    // Empire State Building
        pickupLong: -73985600,
        destLat: 40785800,      // Central Park
        destLong: -73968300,
        maxFare: 3500,
        description: "Empire State → Central Park"
      },
      {
        pickupLat: 40706900,    // Brooklyn Bridge
        pickupLong: -73996700,
        destLat: 40689200,      // Brooklyn
        destLong: -73990000,
        maxFare: 4000,
        description: "Brooklyn Bridge → Brooklyn"
      }
    ];

    const requestIds = await simulateRideRequests(passengers, rideData);

    await sleep(2000);

    // Step 3: Display ride requests
    console.log("=".repeat(60));
    console.log("Simulation Step 3: Ride Request Details");
    console.log("=".repeat(60));
    console.log();

    for (let i = 0; i < requestIds.length; i++) {
      if (requestIds[i]) {
        console.log(`Ride Request ${i + 1} (${rideData[i].description}):`);
        try {
          await getRideRequestInfo(requestIds[i]);
        } catch (error) {
          console.error(`Failed to fetch request info:`, error.message);
          console.log();
        }
        await sleep(1000);
      }
    }

    // Step 4: Display final statistics
    await displayStatistics(contracts);

    // Simulation summary
    console.log("=".repeat(60));
    console.log("Simulation Complete");
    console.log("=".repeat(60));
    console.log();
    console.log("Simulation Summary:");
    console.log(`  Drivers Registered:    ${registeredDrivers.length}`);
    console.log(`  Ride Requests Created: ${requestIds.length}`);
    console.log(`  Network:               ${network}`);
    console.log(`  Duration:              ~${(registeredDrivers.length + requestIds.length) * 1.5}s`);
    console.log();

    console.log("Next Steps:");
    console.log("  1. View contract on Etherscan");
    console.log("  2. Test driver offer submissions");
    console.log("  3. Test ride completion workflow");
    console.log("  4. Test pause/unpause functionality");
    console.log();
    console.log("=".repeat(60));

  } catch (error) {
    console.error();
    console.error("Simulation failed:");
    console.error(error);
    process.exit(1);
  }
}

// Execute simulation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
