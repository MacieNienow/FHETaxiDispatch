const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('PauserSet', function () {
  let pauserSet;
  let owner, pauser1, pauser2, pauser3, nonPauser;

  beforeEach(async function () {
    [owner, pauser1, pauser2, pauser3, nonPauser] = await ethers.getSigners();

    const PauserSet = await ethers.getContractFactory('PauserSet');
    pauserSet = await PauserSet.deploy([pauser1.address, pauser2.address, pauser3.address]);
    await pauserSet.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should deploy with correct pauser addresses', async function () {
      expect(await pauserSet.isPauser(pauser1.address)).to.be.true;
      expect(await pauserSet.isPauser(pauser2.address)).to.be.true;
      expect(await pauserSet.isPauser(pauser3.address)).to.be.true;
    });

    it('Should have correct pauser count', async function () {
      expect(await pauserSet.getPauserCount()).to.equal(3);
    });

    it('Should revert if no pausers provided', async function () {
      const PauserSet = await ethers.getContractFactory('PauserSet');
      await expect(PauserSet.deploy([])).to.be.revertedWith('PauserSet: at least one pauser required');
    });

    it('Should revert if zero address provided', async function () {
      const PauserSet = await ethers.getContractFactory('PauserSet');
      await expect(
        PauserSet.deploy([pauser1.address, ethers.ZeroAddress])
      ).to.be.revertedWith('PauserSet: zero address not allowed');
    });

    it('Should revert if duplicate pauser address', async function () {
      const PauserSet = await ethers.getContractFactory('PauserSet');
      await expect(
        PauserSet.deploy([pauser1.address, pauser1.address])
      ).to.be.revertedWith('PauserSet: duplicate pauser address');
    });

    it('Should emit PauserAdded events', async function () {
      const PauserSet = await ethers.getContractFactory('PauserSet');
      const contract = await PauserSet.deploy([pauser1.address, pauser2.address]);
      const receipt = await contract.deploymentTransaction().wait();

      // Check for PauserAdded events in the receipt
      const events = receipt.logs.filter(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === 'PauserAdded';
        } catch {
          return false;
        }
      });

      expect(events.length).to.equal(2);
    });
  });

  describe('isPauser', function () {
    it('Should return true for authorized pausers', async function () {
      expect(await pauserSet.isPauser(pauser1.address)).to.be.true;
      expect(await pauserSet.isPauser(pauser2.address)).to.be.true;
      expect(await pauserSet.isPauser(pauser3.address)).to.be.true;
    });

    it('Should return false for non-pausers', async function () {
      expect(await pauserSet.isPauser(nonPauser.address)).to.be.false;
      expect(await pauserSet.isPauser(owner.address)).to.be.false;
    });
  });

  describe('getPauserAtIndex', function () {
    it('Should return correct pauser at index', async function () {
      expect(await pauserSet.getPauserAtIndex(0)).to.equal(pauser1.address);
      expect(await pauserSet.getPauserAtIndex(1)).to.equal(pauser2.address);
      expect(await pauserSet.getPauserAtIndex(2)).to.equal(pauser3.address);
    });

    it('Should revert for out of bounds index', async function () {
      await expect(pauserSet.getPauserAtIndex(3)).to.be.revertedWith('PauserSet: index out of bounds');
      await expect(pauserSet.getPauserAtIndex(100)).to.be.revertedWith('PauserSet: index out of bounds');
    });
  });

  describe('getAllPausers', function () {
    it('Should return all pauser addresses', async function () {
      const pausers = await pauserSet.getAllPausers();
      expect(pausers.length).to.equal(3);
      expect(pausers[0]).to.equal(pauser1.address);
      expect(pausers[1]).to.equal(pauser2.address);
      expect(pausers[2]).to.equal(pauser3.address);
    });
  });

  describe('Immutability', function () {
    it('Should not allow pauser modification after deployment', async function () {
      // Contract should have no functions to add/remove pausers
      const pauserSetInterface = pauserSet.interface;
      const fragments = pauserSetInterface.fragments;

      const modificationFunctions = fragments.filter(f =>
        f.type === 'function' &&
        (f.name.includes('add') || f.name.includes('remove') || f.name.includes('set'))
      );

      expect(modificationFunctions.length).to.equal(0);
    });
  });
});
