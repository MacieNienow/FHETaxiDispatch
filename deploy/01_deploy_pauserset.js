module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer, pauser1, pauser2 } = await getNamedAccounts();

  log('----------------------------------------------------');
  log('Deploying PauserSet...');

  // Get pauser addresses - use deployer as fallback if named accounts not available
  const pauserAddresses = [
    pauser1 || deployer,
    pauser2 || deployer,
  ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

  const pauserSet = await deploy('PauserSet', {
    from: deployer,
    args: [pauserAddresses],
    log: true,
    waitConfirmations: 1,
  });

  log(`PauserSet deployed at: ${pauserSet.address}`);
  log(`Pauser addresses: ${pauserAddresses.join(', ')}`);
  log('----------------------------------------------------');
};

module.exports.tags = ['PauserSet', 'all'];
