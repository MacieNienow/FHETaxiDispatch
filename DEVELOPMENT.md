# Development Guide - Private Taxi Dispatch

## 🏗️ Project Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MetaMask or compatible Web3 wallet
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dapp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Environment Configuration

Edit `.env` file with your settings:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gateway Configuration
KMS_GENERATION_ADDRESS=0x... # Zama KMS address
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...

# Feature Flags
REPORT_GAS=false
```

## 🔨 Development Commands

### Compile Contracts

```bash
# Compile all Solidity contracts
npm run compile

# This will generate:
# - artifacts/ (contract ABIs and bytecode)
# - typechain-types/ (TypeScript type definitions)
# - cache/ (compilation cache)
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm run test:gateway
npm run test:dispatch

# Run with gas reporting
npm run test:gas

# Run with coverage
npm run test:coverage
```

### Deploy Contracts

```bash
# Deploy to local hardhat network
npm run node                    # Terminal 1: Start local node
npm run deploy:localhost        # Terminal 2: Deploy contracts

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy with tags
npx hardhat deploy --tags PauserSet
npx hardhat deploy --tags TaxiGateway
npx hardhat deploy --tags all
```

### Contract Size Analysis

```bash
# Check contract sizes
npm run size

# Output shows contract sizes and gas costs
# Ensure contracts are under 24KB limit
```

### TypeScript Type Generation

```bash
# Generate TypeChain types
npm run typechain

# Types are generated in typechain-types/
```

## 📁 Project Structure

```
dapp/
├── contracts/              # Solidity smart contracts
│   ├── PrivateTaxiDispatch.sol
│   ├── TaxiGateway.sol
│   ├── PauserSet.sol
│   └── test/              # Mock contracts for testing
│       ├── MockKMSGeneration.sol
│       └── MockDecryption.sol
├── deploy/                # Hardhat-deploy scripts
│   ├── 01_deploy_pauserset.js
│   ├── 02_deploy_gateway.js
│   └── 03_deploy_dispatch.js
├── test/                  # Test files
│   ├── PauserSet.test.js
│   ├── TaxiGateway.test.js
│   └── PrivateTaxiDispatch.test.js
├── public/                # Frontend files
│   ├── index.html
│   ├── app.js
│   ├── fhe-utils.js      # FHE utility functions
│   └── styles.css
├── typechain-types/       # Generated TypeScript types
├── hardhat.config.js      # Hardhat configuration
├── package.json
└── tsconfig.json
```

## 🧪 Testing Guidelines

### Test Structure

Each contract has comprehensive test coverage:

1. **PauserSet Tests**: Immutable pauser management
2. **TaxiGateway Tests**: Gateway pause/unpause, KMS integration
3. **PrivateTaxiDispatch Tests**: Full ride lifecycle

### Writing Tests

```javascript
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('YourContract', function () {
  let contract;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory('YourContract');
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  it('Should do something', async function () {
    await expect(contract.someFunction())
      .to.emit(contract, 'SomeEvent')
      .withArgs(expectedValue);
  });
});
```

### Test Best Practices

- Test happy paths and edge cases
- Verify error messages with custom errors
- Check event emissions
- Test access control
- Verify state changes
- Test integration between contracts

## 🔐 FHE Integration

### Using FHEVM in Contracts

```solidity
import { FHE, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is SepoliaConfig {
    // Encrypt a value
    euint32 encrypted = FHE.asEuint32(plainValue);

    // Grant ACL permissions
    FHE.allowThis(encrypted);
    FHE.allow(encrypted, userAddress);

    // Compare encrypted values
    ebool isGreater = FHE.gt(encrypted1, encrypted2);
}
```

### Frontend FHE Integration

```javascript
// Initialize FHE
const fheUtils = new FHEUtils();
await fheUtils.init(provider);

// Encrypt data
const encryptedLat = await fheUtils.encryptUint32(latitude);
const encryptedLng = await fheUtils.encryptUint32(longitude);

// Send to contract
await contract.updateLocation(encryptedLat, encryptedLng);
```

## 🚀 Deployment Guide

### Local Deployment

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat deploy --network localhost

# The deployed addresses will be saved in deployments/localhost/
```

### Sepolia Testnet Deployment

1. Get Sepolia ETH from faucet
2. Configure `.env` with Sepolia RPC and private key
3. Deploy:

```bash
npx hardhat deploy --network sepolia
```

4. Verify contracts on Etherscan:

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "constructor" "args"
```

### Production Deployment Checklist

- [ ] All tests passing
- [ ] Contract sizes under 24KB
- [ ] Gas optimization complete
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] Multisig wallet setup for admin functions
- [ ] Emergency pause mechanism tested
- [ ] Frontend updated with contract addresses

## 🔧 Troubleshooting

### Common Issues

**Issue**: `Contract size exceeds 24KB`
```bash
# Solution: Enable optimizer in hardhat.config.js
optimizer: {
  enabled: true,
  runs: 200,
}
```

**Issue**: `FHE initialization failed`
```javascript
// Solution: Check network and gateway configuration
const chainId = await provider.getNetwork().chainId;
const gatewayUrl = getGatewayUrl(chainId);
```

**Issue**: `Nonce too low` error
```bash
# Solution: Reset MetaMask account
# Settings > Advanced > Reset Account
```

**Issue**: Tests failing with "Contract not deployed"
```javascript
// Solution: Ensure waitForDeployment() is called
await contract.waitForDeployment();
```

## 📊 Gas Optimization Tips

1. **Use custom errors** instead of require strings
2. **Pack storage variables** to save slots
3. **Use immutable** for variables set once
4. **Batch operations** when possible
5. **Optimize loops** and array operations
6. **Use events** for data that doesn't need on-chain storage

## 🔍 Debugging

### Hardhat Console

```bash
npx hardhat console --network localhost

> const Contract = await ethers.getContractFactory('PrivateTaxiDispatch');
> const contract = await Contract.attach('0x...');
> await contract.getSystemStats();
```

### Event Debugging

```javascript
// Listen to all events
contract.on('*', (event) => {
  console.log('Event:', event);
});

// Filter specific events
const filter = contract.filters.RideRequested();
const events = await contract.queryFilter(filter);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

## 📝 License

MIT License - see LICENSE file for details
