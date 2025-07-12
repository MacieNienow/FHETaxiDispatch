module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  log('----------------------------------------------------');
  log('Deploying PrivateTaxiDispatch...');

  // Get TaxiGateway deployment
  const taxiGateway = await get('TaxiGateway');

  const privateTaxiDispatch = await deploy('PrivateTaxiDispatch', {
    from: deployer,
    args: [taxiGateway.address],
    log: true,
    waitConfirmations: 1,
  });

  log(`PrivateTaxiDispatch deployed at: ${privateTaxiDispatch.address}`);
  log(`Gateway: ${taxiGateway.address}`);
  log(`Dispatcher: ${deployer}`);
  log('----------------------------------------------------');

  // Log deployment summary
  log('\n=== DEPLOYMENT SUMMARY ===');
  log(`Network: ${network.name}`);
  log(`Deployer: ${deployer}`);
  log(`\nContracts:`);
  log(`- PauserSet: ${(await get('PauserSet')).address}`);
  log(`- TaxiGateway: ${taxiGateway.address}`);
  log(`- PrivateTaxiDispatch: ${privateTaxiDispatch.address}`);
  log('==========================\n');
};

module.exports.tags = ['PrivateTaxiDispatch', 'all'];
module.exports.dependencies = ['TaxiGateway'];
