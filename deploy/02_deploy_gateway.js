module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  log('----------------------------------------------------');
  log('Deploying TaxiGateway...');

  // Get PauserSet deployment
  const pauserSet = await get('PauserSet');

  // KMS Generation contract address
  // For Sepolia testnet, use the actual Zama KMS Generation contract
  // For local/hardhat, deploy a mock
  let kmsGenerationAddress;

  if (network.name === 'sepolia') {
    // Replace with actual Zama KMS Generation contract address on Sepolia
    kmsGenerationAddress = process.env.KMS_GENERATION_ADDRESS || '0x0000000000000000000000000000000000000000';
    log(`Using KMS Generation contract at: ${kmsGenerationAddress}`);
  } else {
    // Deploy mock for local testing
    const mockKMS = await deploy('MockKMSGeneration', {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
    });
    kmsGenerationAddress = mockKMS.address;
    log(`Deployed MockKMSGeneration at: ${kmsGenerationAddress}`);
  }

  const taxiGateway = await deploy('TaxiGateway', {
    from: deployer,
    args: [pauserSet.address, kmsGenerationAddress],
    log: true,
    waitConfirmations: 1,
  });

  log(`TaxiGateway deployed at: ${taxiGateway.address}`);
  log(`PauserSet: ${pauserSet.address}`);
  log(`KMS Generation: ${kmsGenerationAddress}`);
  log('----------------------------------------------------');
};

module.exports.tags = ['TaxiGateway', 'all'];
module.exports.dependencies = ['PauserSet'];
