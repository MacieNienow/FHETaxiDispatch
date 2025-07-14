const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('PrivateTaxiDispatch', function () {
  let privateTaxiDispatch;
  let taxiGateway;
  let pauserSet;
  let mockKMS;
  let owner, dispatcher, driver1, driver2, passenger1, passenger2, pauser;

  // Test data
  const LOCATION = {
    lat: 40758896,  // Example: 40.758896 (NYC coordinates scaled)
    lng: -73985130  // Example: -73.985130
  };

  beforeEach(async function () {
    [owner, dispatcher, driver1, driver2, passenger1, passenger2, pauser] = await ethers.getSigners();

    // Deploy PauserSet
    const PauserSet = await ethers.getContractFactory('PauserSet');
    pauserSet = await PauserSet.deploy([pauser.address]);
    await pauserSet.waitForDeployment();

    // Deploy MockKMSGeneration
    const MockKMS = await ethers.getContractFactory('MockKMSGeneration');
    mockKMS = await MockKMS.deploy();
    await mockKMS.waitForDeployment();

    // Deploy TaxiGateway
    const TaxiGateway = await ethers.getContractFactory('TaxiGateway');
    taxiGateway = await TaxiGateway.deploy(
      await pauserSet.getAddress(),
      await mockKMS.getAddress()
    );
    await taxiGateway.waitForDeployment();

    // Deploy PrivateTaxiDispatch
    const PrivateTaxiDispatch = await ethers.getContractFactory('PrivateTaxiDispatch');
    privateTaxiDispatch = await PrivateTaxiDispatch.connect(dispatcher).deploy(
      await taxiGateway.getAddress()
    );
    await privateTaxiDispatch.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the correct dispatcher', async function () {
      expect(await privateTaxiDispatch.dispatcher()).to.equal(dispatcher.address);
    });

    it('Should initialize counters to zero', async function () {
      expect(await privateTaxiDispatch.requestCounter()).to.equal(0);
      expect(await privateTaxiDispatch.driverCounter()).to.equal(0);
    });

    it('Should set the gateway address', async function () {
      expect(await privateTaxiDispatch.getGatewayAddress()).to.equal(await taxiGateway.getAddress());
    });

    it('Should deploy without gateway', async function () {
      const PrivateTaxiDispatch = await ethers.getContractFactory('PrivateTaxiDispatch');
      const noGateway = await PrivateTaxiDispatch.deploy(ethers.ZeroAddress);
      await noGateway.waitForDeployment();
      expect(await noGateway.getGatewayAddress()).to.equal(ethers.ZeroAddress);
    });
  });

  describe('Gateway integration', function () {
    it('Should allow dispatcher to update gateway', async function () {
      const newGateway = await (await ethers.getContractFactory('TaxiGateway')).deploy(
        await pauserSet.getAddress(),
        await mockKMS.getAddress()
      );
      await newGateway.waitForDeployment();

      await privateTaxiDispatch.connect(dispatcher).setGateway(await newGateway.getAddress());
      expect(await privateTaxiDispatch.getGatewayAddress()).to.equal(await newGateway.getAddress());
    });

    it('Should not allow non-dispatcher to update gateway', async function () {
      await expect(
        privateTaxiDispatch.connect(driver1).setGateway(await taxiGateway.getAddress())
      ).to.be.revertedWith('Not authorized');
    });

    it('Should not allow zero address for gateway', async function () {
      await expect(
        privateTaxiDispatch.connect(dispatcher).setGateway(ethers.ZeroAddress)
      ).to.be.revertedWith('Invalid gateway address');
    });

    it('Should report system as operational when gateway is not paused', async function () {
      expect(await privateTaxiDispatch.isSystemOperational()).to.be.true;
    });

    it('Should report system as not operational when gateway is paused', async function () {
      await taxiGateway.connect(pauser).pause();
      expect(await privateTaxiDispatch.isSystemOperational()).to.be.false;
    });
  });

  describe('Driver registration', function () {
    it('Should allow driver registration when operational', async function () {
      await expect(privateTaxiDispatch.connect(driver1).registerDriver())
        .to.emit(privateTaxiDispatch, 'DriverRegistered')
        .withArgs(driver1.address, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));

      expect(await privateTaxiDispatch.driverCounter()).to.equal(1);
      expect(await privateTaxiDispatch.isRegisteredDriver(driver1.address)).to.be.true;
    });

    it('Should not allow duplicate registration', async function () {
      await privateTaxiDispatch.connect(driver1).registerDriver();
      await expect(
        privateTaxiDispatch.connect(driver1).registerDriver()
      ).to.be.revertedWith('Already registered');
    });

    it('Should not allow registration when system is paused', async function () {
      await taxiGateway.connect(pauser).pause();
      await expect(
        privateTaxiDispatch.connect(driver1).registerDriver()
      ).to.be.revertedWith('System paused by gateway');
    });

    it('Should initialize driver with correct defaults', async function () {
      await privateTaxiDispatch.connect(driver1).registerDriver();
      const driverInfo = await privateTaxiDispatch.getDriverInfo(driver1.address);

      expect(driverInfo.isRegistered).to.be.true;
      expect(driverInfo.isAvailable).to.be.false;
      expect(driverInfo.totalRides).to.equal(0);
    });
  });

  describe('Location updates', function () {
    beforeEach(async function () {
      await privateTaxiDispatch.connect(driver1).registerDriver();
    });

    it('Should allow registered driver to update location', async function () {
      await expect(
        privateTaxiDispatch.connect(driver1).updateLocation(LOCATION.lat, LOCATION.lng)
      ).to.emit(privateTaxiDispatch, 'LocationUpdated').withArgs(driver1.address);
    });

    it('Should not allow non-registered driver to update location', async function () {
      await expect(
        privateTaxiDispatch.connect(driver2).updateLocation(LOCATION.lat, LOCATION.lng)
      ).to.be.revertedWith('Driver not registered');
    });

    it('Should not allow location update when paused', async function () {
      await taxiGateway.connect(pauser).pause();
      await expect(
        privateTaxiDispatch.connect(driver1).updateLocation(LOCATION.lat, LOCATION.lng)
      ).to.be.revertedWith('System paused by gateway');
    });
  });

  describe('Availability management', function () {
    beforeEach(async function () {
      await privateTaxiDispatch.connect(driver1).registerDriver();
    });

    it('Should allow driver to set availability', async function () {
      await privateTaxiDispatch.connect(driver1).setAvailability(true);
      expect(await privateTaxiDispatch.isDriverAvailable(driver1.address)).to.be.true;

      await privateTaxiDispatch.connect(driver1).setAvailability(false);
      expect(await privateTaxiDispatch.isDriverAvailable(driver1.address)).to.be.false;
    });

    it('Should not allow non-registered driver to set availability', async function () {
      await expect(
        privateTaxiDispatch.connect(driver2).setAvailability(true)
      ).to.be.revertedWith('Driver not registered');
    });
  });

  describe('Ride requests', function () {
    it('Should allow passenger to request ride', async function () {
      await expect(
        privateTaxiDispatch.connect(passenger1).requestRide(
          LOCATION.lat,
          LOCATION.lng,
          LOCATION.lat + 1000,
          LOCATION.lng + 1000,
          5000 // Max fare
        )
      ).to.emit(privateTaxiDispatch, 'RideRequested').withArgs(1, passenger1.address);

      expect(await privateTaxiDispatch.requestCounter()).to.equal(1);
    });

    it('Should not allow ride request when paused', async function () {
      await taxiGateway.connect(pauser).pause();
      await expect(
        privateTaxiDispatch.connect(passenger1).requestRide(
          LOCATION.lat,
          LOCATION.lng,
          LOCATION.lat + 1000,
          LOCATION.lng + 1000,
          5000
        )
      ).to.be.revertedWith('System paused by gateway');
    });

    it('Should track passenger history', async function () {
      await privateTaxiDispatch.connect(passenger1).requestRide(
        LOCATION.lat, LOCATION.lng, LOCATION.lat + 1000, LOCATION.lng + 1000, 5000
      );

      const history = await privateTaxiDispatch.getPassengerHistory(passenger1.address);
      expect(history.length).to.equal(1);
      expect(history[0]).to.equal(1);
    });

    it('Should allow multiple requests from same passenger', async function () {
      await privateTaxiDispatch.connect(passenger1).requestRide(
        LOCATION.lat, LOCATION.lng, LOCATION.lat + 1000, LOCATION.lng + 1000, 5000
      );
      await privateTaxiDispatch.connect(passenger1).requestRide(
        LOCATION.lat, LOCATION.lng, LOCATION.lat + 2000, LOCATION.lng + 2000, 6000
      );

      expect(await privateTaxiDispatch.requestCounter()).to.equal(2);
      const history = await privateTaxiDispatch.getPassengerHistory(passenger1.address);
      expect(history.length).to.equal(2);
    });
  });

  describe('Offer submission', function () {
    let requestId;

    beforeEach(async function () {
      await privateTaxiDispatch.connect(driver1).registerDriver();
      await privateTaxiDispatch.connect(driver1).setAvailability(true);

      const tx = await privateTaxiDispatch.connect(passenger1).requestRide(
        LOCATION.lat, LOCATION.lng, LOCATION.lat + 1000, LOCATION.lng + 1000, 5000
      );
      await tx.wait();
      requestId = 1;
    });

    it('Should allow available driver to submit offer', async function () {
      await expect(
        privateTaxiDispatch.connect(driver1).submitOffer(requestId, 4500, 600)
      ).to.emit(privateTaxiDispatch, 'OfferSubmitted').withArgs(requestId, driver1.address);
    });

    it('Should not allow non-registered driver to submit offer', async function () {
      await expect(
        privateTaxiDispatch.connect(driver2).submitOffer(requestId, 4500, 600)
      ).to.be.revertedWith('Driver not registered');
    });

    it('Should not allow unavailable driver to submit offer', async function () {
      await privateTaxiDispatch.connect(driver1).setAvailability(false);
      await expect(
        privateTaxiDispatch.connect(driver1).submitOffer(requestId, 4500, 600)
      ).to.be.revertedWith('Driver not available');
    });

    it('Should not allow offer when paused', async function () {
      await taxiGateway.connect(pauser).pause();
      await expect(
        privateTaxiDispatch.connect(driver1).submitOffer(requestId, 4500, 600)
      ).to.be.revertedWith('System paused by gateway');
    });

    it('Should not allow offer for invalid request', async function () {
      await expect(
        privateTaxiDispatch.connect(driver1).submitOffer(999, 4500, 600)
      ).to.be.revertedWith('Invalid request');
    });

    it('Should check driver eligibility correctly', async function () {
      expect(await privateTaxiDispatch.isDriverEligibleForOffer(driver1.address, requestId)).to.be.true;
      expect(await privateTaxiDispatch.isDriverEligibleForOffer(driver2.address, requestId)).to.be.false;
    });
  });

  describe('Offer acceptance', function () {
    let requestId;

    beforeEach(async function () {
      await privateTaxiDispatch.connect(driver1).registerDriver();
      await privateTaxiDispatch.connect(driver1).setAvailability(true);
      await privateTaxiDispatch.connect(driver2).registerDriver();
      await privateTaxiDispatch.connect(driver2).setAvailability(true);

      const tx = await privateTaxiDispatch.connect(passenger1).requestRide(
        LOCATION.lat, LOCATION.lng, LOCATION.lat + 1000, LOCATION.lng + 1000, 5000
      );
      await tx.wait();
      requestId = 1;

      await privateTaxiDispatch.connect(driver1).submitOffer(requestId, 4500, 600);
      await privateTaxiDispatch.connect(driver2).submitOffer(requestId, 4800, 550);
    });

    it('Should allow passenger to accept offer', async function () {
      await expect(
        privateTaxiDispatch.connect(passenger1).acceptOffer(requestId, 0)
      ).to.emit(privateTaxiDispatch, 'RideMatched')
        .withArgs(requestId, driver1.address, passenger1.address);
    });

    it('Should not allow non-passenger to accept offer', async function () {
      await expect(
        privateTaxiDispatch.connect(passenger2).acceptOffer(requestId, 0)
      ).to.be.revertedWith('Not your request');
    });

    it('Should not allow accepting invalid offer index', async function () {
      await expect(
        privateTaxiDispatch.connect(passenger1).acceptOffer(requestId, 10)
      ).to.be.revertedWith('Invalid offer index');
    });

    it('Should mark driver as unavailable after acceptance', async function () {
      await privateTaxiDispatch.connect(passenger1).acceptOffer(requestId, 0);
      expect(await privateTaxiDispatch.isDriverAvailable(driver1.address)).to.be.false;
    });

    it('Should track driver history', async function () {
      await privateTaxiDispatch.connect(passenger1).acceptOffer(requestId, 0);
      const history = await privateTaxiDispatch.getDriverHistory(driver1.address);
      expect(history.length).to.equal(1);
      expect(history[0]).to.equal(requestId);
    });

    it('Should not allow accepting already assigned request', async function () {
      await privateTaxiDispatch.connect(passenger1).acceptOffer(requestId, 0);
      await expect(
        privateTaxiDispatch.connect(passenger1).acceptOffer(requestId, 1)
      ).to.be.revertedWith('Already assigned');
    });
  });

  describe('Ride completion', function () {
    let requestId;

    beforeEach(async function () {
      await privateTaxiDispatch.connect(driver1).registerDriver();
      await privateTaxiDispatch.connect(driver1).setAvailability(true);

      const tx = await privateTaxiDispatch.connect(passenger1).requestRide(
        LOCATION.lat, LOCATION.lng, LOCATION.lat + 1000, LOCATION.lng + 1000, 5000
      );
      await tx.wait();
      requestId = 1;

      await privateTaxiDispatch.connect(driver1).submitOffer(requestId, 4500, 600);
      await privateTaxiDispatch.connect(passenger1).acceptOffer(requestId, 0);
    });

    it('Should allow assigned driver to complete ride', async function () {
      await expect(
        privateTaxiDispatch.connect(driver1).completeRide(requestId, 85)
      ).to.emit(privateTaxiDispatch, 'RideCompleted')
        .withArgs(requestId, driver1.address, passenger1.address);
    });

    it('Should not allow non-assigned driver to complete ride', async function () {
      await expect(
        privateTaxiDispatch.connect(driver2).completeRide(requestId, 85)
      ).to.be.revertedWith('Not assigned driver');
    });

    it('Should not allow invalid rating', async function () {
      await expect(
        privateTaxiDispatch.connect(driver1).completeRide(requestId, 101)
      ).to.be.revertedWith('Invalid rating');
    });

    it('Should update driver stats after completion', async function () {
      await privateTaxiDispatch.connect(driver1).completeRide(requestId, 85);
      const driverInfo = await privateTaxiDispatch.getDriverInfo(driver1.address);
      expect(driverInfo.totalRides).to.equal(1);
      expect(driverInfo.isAvailable).to.be.true;
    });

    it('Should not allow completing already completed ride', async function () {
      await privateTaxiDispatch.connect(driver1).completeRide(requestId, 85);
      await expect(
        privateTaxiDispatch.connect(driver1).completeRide(requestId, 90)
      ).to.be.revertedWith('Request not active');
    });
  });

  describe('Request cancellation', function () {
    let requestId;

    beforeEach(async function () {
      const tx = await privateTaxiDispatch.connect(passenger1).requestRide(
        LOCATION.lat, LOCATION.lng, LOCATION.lat + 1000, LOCATION.lng + 1000, 5000
      );
      await tx.wait();
      requestId = 1;
    });

    it('Should allow passenger to cancel unassigned request', async function () {
      await expect(
        privateTaxiDispatch.connect(passenger1).cancelRequest(requestId)
      ).to.emit(privateTaxiDispatch, 'RideCancelled').withArgs(requestId, passenger1.address);
    });

    it('Should not allow non-passenger to cancel request', async function () {
      await expect(
        privateTaxiDispatch.connect(passenger2).cancelRequest(requestId)
      ).to.be.revertedWith('Not your request');
    });

    it('Should not allow cancelling assigned ride', async function () {
      await privateTaxiDispatch.connect(driver1).registerDriver();
      await privateTaxiDispatch.connect(driver1).setAvailability(true);
      await privateTaxiDispatch.connect(driver1).submitOffer(requestId, 4500, 600);
      await privateTaxiDispatch.connect(passenger1).acceptOffer(requestId, 0);

      await expect(
        privateTaxiDispatch.connect(passenger1).cancelRequest(requestId)
      ).to.be.revertedWith('Cannot cancel assigned ride');
    });

    it('Should check if request is cancellable', async function () {
      expect(await privateTaxiDispatch.isRequestCancellable(passenger1.address, requestId)).to.be.true;
      expect(await privateTaxiDispatch.isRequestCancellable(passenger2.address, requestId)).to.be.false;
    });
  });

  describe('View functions', function () {
    it('Should return correct system stats', async function () {
      await privateTaxiDispatch.connect(driver1).registerDriver();
      await privateTaxiDispatch.connect(passenger1).requestRide(
        LOCATION.lat, LOCATION.lng, LOCATION.lat + 1000, LOCATION.lng + 1000, 5000
      );

      const stats = await privateTaxiDispatch.getSystemStats();
      expect(stats.totalRequests).to.equal(1);
      expect(stats.totalDrivers).to.equal(1);
    });

    it('Should return request info correctly', async function () {
      await privateTaxiDispatch.connect(passenger1).requestRide(
        LOCATION.lat, LOCATION.lng, LOCATION.lat + 1000, LOCATION.lng + 1000, 5000
      );

      const info = await privateTaxiDispatch.getRequestInfo(1);
      expect(info.passenger).to.equal(passenger1.address);
      expect(info.assignedDriver).to.equal(ethers.ZeroAddress);
      expect(info.isCompleted).to.be.false;
      expect(info.isCancelled).to.be.false;
      expect(info.offerCount).to.equal(0);
    });

    it('Should check request active status', async function () {
      await privateTaxiDispatch.connect(passenger1).requestRide(
        LOCATION.lat, LOCATION.lng, LOCATION.lat + 1000, LOCATION.lng + 1000, 5000
      );

      expect(await privateTaxiDispatch.isRequestActive(1)).to.be.true;
      expect(await privateTaxiDispatch.isRequestActive(999)).to.be.false;
    });
  });

  describe('Emergency functions', function () {
    it('Should revert emergency pause if gateway is set', async function () {
      await expect(
        privateTaxiDispatch.connect(dispatcher).emergencyPause()
      ).to.be.revertedWith('Use gateway pause function');
    });

    it('Should allow emergency pause if no gateway', async function () {
      const PrivateTaxiDispatch = await ethers.getContractFactory('PrivateTaxiDispatch');
      const noGateway = await PrivateTaxiDispatch.connect(dispatcher).deploy(ethers.ZeroAddress);
      await noGateway.waitForDeployment();

      // Should not revert (though function doesn't do anything without gateway)
      await noGateway.connect(dispatcher).emergencyPause();
    });
  });
});
