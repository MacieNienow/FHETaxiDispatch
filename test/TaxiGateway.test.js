const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TaxiGateway', function () {
  let taxiGateway;
  let pauserSet;
  let mockKMSGeneration;
  let owner, pauser1, pauser2, nonPauser, user;

  beforeEach(async function () {
    [owner, pauser1, pauser2, nonPauser, user] = await ethers.getSigners();

    // Deploy PauserSet
    const PauserSet = await ethers.getContractFactory('PauserSet');
    pauserSet = await PauserSet.deploy([pauser1.address, pauser2.address]);
    await pauserSet.waitForDeployment();

    // Deploy mock KMS Generation contract
    const MockKMSGeneration = await ethers.getContractFactory('MockKMSGeneration');
    mockKMSGeneration = await MockKMSGeneration.deploy();
    await mockKMSGeneration.waitForDeployment();

    // Deploy TaxiGateway
    const TaxiGateway = await ethers.getContractFactory('TaxiGateway');
    taxiGateway = await TaxiGateway.deploy(
      await pauserSet.getAddress(),
      await mockKMSGeneration.getAddress()
    );
    await taxiGateway.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the correct owner', async function () {
      expect(await taxiGateway.owner()).to.equal(owner.address);
    });

    it('Should reference correct PauserSet', async function () {
      expect(await taxiGateway.pauserSet()).to.equal(await pauserSet.getAddress());
    });

    it('Should reference correct KMS Generation contract', async function () {
      expect(await taxiGateway.kmsGenerationContract()).to.equal(await mockKMSGeneration.getAddress());
    });

    it('Should start unpaused', async function () {
      expect(await taxiGateway.paused()).to.be.false;
      expect(await taxiGateway.isOperational()).to.be.true;
    });

    it('Should revert if PauserSet address is zero', async function () {
      const TaxiGateway = await ethers.getContractFactory('TaxiGateway');
      await expect(
        TaxiGateway.deploy(ethers.ZeroAddress, await mockKMSGeneration.getAddress())
      ).to.be.revertedWith('TaxiGateway: invalid PauserSet address');
    });

    it('Should revert if KMS Generation address is zero', async function () {
      const TaxiGateway = await ethers.getContractFactory('TaxiGateway');
      await expect(
        TaxiGateway.deploy(await pauserSet.getAddress(), ethers.ZeroAddress)
      ).to.be.revertedWith('TaxiGateway: invalid KMS Generation address');
    });
  });

  describe('Pause functionality', function () {
    it('Should allow authorized pauser to pause', async function () {
      await expect(taxiGateway.connect(pauser1).pause())
        .to.emit(taxiGateway, 'Paused')
        .withArgs(pauser1.address);

      expect(await taxiGateway.paused()).to.be.true;
      expect(await taxiGateway.isOperational()).to.be.false;
    });

    it('Should not allow non-pauser to pause', async function () {
      await expect(taxiGateway.connect(nonPauser).pause()).to.be.revertedWith(
        'TaxiGateway: caller is not authorized pauser'
      );
    });

    it('Should not allow pausing when already paused', async function () {
      await taxiGateway.connect(pauser1).pause();
      await expect(taxiGateway.connect(pauser2).pause()).to.be.revertedWith(
        'TaxiGateway: contract is paused'
      );
    });
  });

  describe('Unpause functionality', function () {
    beforeEach(async function () {
      await taxiGateway.connect(pauser1).pause();
    });

    it('Should allow owner to unpause', async function () {
      await expect(taxiGateway.connect(owner).unpause())
        .to.emit(taxiGateway, 'Unpaused')
        .withArgs(owner.address);

      expect(await taxiGateway.paused()).to.be.false;
      expect(await taxiGateway.isOperational()).to.be.true;
    });

    it('Should not allow non-owner to unpause', async function () {
      await expect(taxiGateway.connect(pauser1).unpause()).to.be.revertedWith(
        'TaxiGateway: caller is not owner'
      );
      await expect(taxiGateway.connect(nonPauser).unpause()).to.be.revertedWith(
        'TaxiGateway: caller is not owner'
      );
    });

    it('Should not allow unpausing when not paused', async function () {
      await taxiGateway.connect(owner).unpause();
      await expect(taxiGateway.connect(owner).unpause()).to.be.revertedWith(
        'TaxiGateway: contract is not paused'
      );
    });
  });

  describe('Decryption contract management', function () {
    let mockDecryption;

    beforeEach(async function () {
      const MockDecryption = await ethers.getContractFactory('MockDecryption');
      mockDecryption = await MockDecryption.deploy();
      await mockDecryption.waitForDeployment();
    });

    it('Should allow owner to set decryption contract', async function () {
      await taxiGateway.connect(owner).setDecryptionContract(await mockDecryption.getAddress());
      expect(await taxiGateway.decryptionContract()).to.equal(await mockDecryption.getAddress());
    });

    it('Should not allow non-owner to set decryption contract', async function () {
      await expect(
        taxiGateway.connect(nonPauser).setDecryptionContract(await mockDecryption.getAddress())
      ).to.be.revertedWith('TaxiGateway: caller is not owner');
    });

    it('Should not allow zero address as decryption contract', async function () {
      await expect(
        taxiGateway.connect(owner).setDecryptionContract(ethers.ZeroAddress)
      ).to.be.revertedWith('TaxiGateway: invalid decryption contract');
    });
  });

  describe('Public decryption authorization', function () {
    let mockDecryption;

    beforeEach(async function () {
      const MockDecryption = await ethers.getContractFactory('MockDecryption');
      mockDecryption = await MockDecryption.deploy();
      await mockDecryption.waitForDeployment();
      await taxiGateway.connect(owner).setDecryptionContract(await mockDecryption.getAddress());
    });

    it('Should allow decryption when operational', async function () {
      expect(await taxiGateway.isPublicDecryptAllowed(user.address)).to.be.true;
    });

    it('Should not allow decryption when paused', async function () {
      await taxiGateway.connect(pauser1).pause();
      expect(await taxiGateway.isPublicDecryptAllowed(user.address)).to.be.false;
    });

    it('Should not allow decryption for zero address', async function () {
      expect(await taxiGateway.isPublicDecryptAllowed(ethers.ZeroAddress)).to.be.false;
    });

    it('Should not allow decryption if decryption contract not set', async function () {
      const TaxiGateway = await ethers.getContractFactory('TaxiGateway');
      const newGateway = await TaxiGateway.deploy(
        await pauserSet.getAddress(),
        await mockKMSGeneration.getAddress()
      );
      await newGateway.waitForDeployment();

      expect(await newGateway.isPublicDecryptAllowed(user.address)).to.be.false;
    });
  });

  describe('Request decryption', function () {
    let mockDecryption;

    beforeEach(async function () {
      const MockDecryption = await ethers.getContractFactory('MockDecryption');
      mockDecryption = await MockDecryption.deploy();
      await mockDecryption.waitForDeployment();
      await taxiGateway.connect(owner).setDecryptionContract(await mockDecryption.getAddress());
    });

    it('Should request decryption successfully', async function () {
      const ciphertext = ethers.hexlify(ethers.randomBytes(32));
      const tx = await taxiGateway.connect(user).requestDecryption(ciphertext);
      const receipt = await tx.wait();

      // Check for DecryptionRequested event
      const event = receipt.logs.find(log => {
        try {
          const parsed = taxiGateway.interface.parseLog(log);
          return parsed && parsed.name === 'DecryptionRequested';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it('Should not allow decryption when paused', async function () {
      await taxiGateway.connect(pauser1).pause();
      const ciphertext = ethers.hexlify(ethers.randomBytes(32));
      await expect(taxiGateway.connect(user).requestDecryption(ciphertext)).to.be.revertedWith(
        'TaxiGateway: contract is paused'
      );
    });

    it('Should not allow empty ciphertext', async function () {
      await expect(taxiGateway.connect(user).requestDecryption('0x')).to.be.revertedWith(
        'TaxiGateway: empty ciphertext'
      );
    });

    it('Should revert if decryption contract not set', async function () {
      const TaxiGateway = await ethers.getContractFactory('TaxiGateway');
      const newGateway = await TaxiGateway.deploy(
        await pauserSet.getAddress(),
        await mockKMSGeneration.getAddress()
      );
      await newGateway.waitForDeployment();

      const ciphertext = ethers.hexlify(ethers.randomBytes(32));
      await expect(newGateway.connect(user).requestDecryption(ciphertext)).to.be.revertedWith(
        'TaxiGateway: decryption contract not set'
      );
    });
  });

  describe('KMS Generation integration', function () {
    it('Should call KMS Generation successfully', async function () {
      const data = ethers.hexlify(ethers.randomBytes(32));
      await expect(taxiGateway.connect(user).callKMSGeneration(data))
        .to.emit(taxiGateway, 'KMSGenerationCalled')
        .withArgs(user.address, data);
    });

    it('Should not allow KMS call when paused', async function () {
      await taxiGateway.connect(pauser1).pause();
      const data = ethers.hexlify(ethers.randomBytes(32));
      await expect(taxiGateway.connect(user).callKMSGeneration(data)).to.be.revertedWith(
        'TaxiGateway: contract is paused'
      );
    });

    it('Should not allow empty data', async function () {
      await expect(taxiGateway.connect(user).callKMSGeneration('0x')).to.be.revertedWith(
        'TaxiGateway: empty data'
      );
    });

    it('Should check KMS configuration', async function () {
      expect(await taxiGateway.isKMSGenerationConfigured()).to.be.true;
    });
  });

  describe('View functions', function () {
    it('Should return correct pauser count', async function () {
      expect(await taxiGateway.getPauserCount()).to.equal(2);
    });

    it('Should check pause authorization correctly', async function () {
      expect(await taxiGateway.isPauseAuthorized(pauser1.address)).to.be.true;
      expect(await taxiGateway.isPauseAuthorized(pauser2.address)).to.be.true;
      expect(await taxiGateway.isPauseAuthorized(nonPauser.address)).to.be.false;
    });

    it('Should return correct gateway status', async function () {
      let status = await taxiGateway.getGatewayStatus();
      expect(status.isPaused).to.be.false;
      expect(status.pauserCount).to.equal(2);
      expect(status.kmsConfigured).to.be.true;
      expect(status.decryptionConfigured).to.be.false;

      // Pause and check again
      await taxiGateway.connect(pauser1).pause();
      status = await taxiGateway.getGatewayStatus();
      expect(status.isPaused).to.be.true;
    });
  });
});

// Mock contracts for testing
describe('Mock Contracts', function () {
  it('Should deploy MockKMSGeneration', async function () {
    const MockKMSGeneration = await ethers.getContractFactory('MockKMSGeneration');
    const mock = await MockKMSGeneration.deploy();
    await mock.waitForDeployment();
    expect(await mock.getAddress()).to.not.equal(ethers.ZeroAddress);
  });

  it('Should deploy MockDecryption', async function () {
    const MockDecryption = await ethers.getContractFactory('MockDecryption');
    const mock = await MockDecryption.deploy();
    await mock.waitForDeployment();
    expect(await mock.getAddress()).to.not.equal(ethers.ZeroAddress);
  });
});
