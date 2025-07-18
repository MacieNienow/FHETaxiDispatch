require('@nomicfoundation/hardhat-toolbox');
require('@fhevm/hardhat-plugin');
require('hardhat-deploy');
require('hardhat-contract-sizer');
require('dotenv/config');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'cancun',
    },
  },

  networks: {
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true,
        interval: 0,
      },
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR-PROJECT-ID',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 'auto',
      gas: 'auto',
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    pauser1: {
      default: 1,
    },
    pauser2: {
      default: 2,
    },
  },

  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [':PrivateTaxiDispatch$', ':TaxiGateway$', ':PauserSet$'],
  },

  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
    alwaysGenerateOverloads: false,
    externalArtifacts: ['node_modules/@fhevm/solidity/abi/*.json'],
    dontOverrideCompile: false,
  },

  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
    deploy: './deploy',
    deployments: './deployments',
  },

  mocha: {
    timeout: 100000,
    bail: false,
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
  },

  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || '',
    },
  },
};
