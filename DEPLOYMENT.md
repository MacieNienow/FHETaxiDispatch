# Private Taxi Dispatch - Deployment Guide

Complete guide for deploying the Private Taxi Dispatch system using Hardhat.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Compilation and Testing](#compilation-and-testing)
- [Deployment Process](#deployment-process)
- [Contract Verification](#contract-verification)
- [Post-Deployment](#post-deployment)
- [Network Information](#network-information)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 or **yarn**: >= 1.22.0
- **Git**: For version control

### Required Accounts

1. **Ethereum Wallet**
   - MetaMask or similar Web3 wallet
   - Private key exported for deployment

2. **Sepolia Testnet ETH**
   - Get free testnet ETH from:
     - [Sepolia Faucet](https://sepoliafaucet.com/)
     - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
     - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

3. **API Keys**
   - **Infura or Alchemy**: For RPC access ([Get Infura Key](https://infura.io/) | [Get Alchemy Key](https://www.alchemy.com/))
   - **Etherscan**: For contract verification ([Get API Key](https://etherscan.io/myapikey))

## Environment Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/MacieNienow/PrivateTaxiDispatch.git
cd PrivateTaxiDispatch

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Deployment Configuration
PRIVATE_KEY=your_private_key_without_0x_prefix
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID

# Contract Verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Pauser Addresses
PAUSER1_ADDRESS=0xYourPauser1Address
PAUSER2_ADDRESS=0xYourPauser2Address
```

### Step 3: Verify Configuration

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Verify Hardhat setup
npx hardhat compile
```

## Compilation and Testing

### Compile Contracts

```bash
# Compile all contracts
npm run compile

# Generate TypeChain types
npm run typechain

# Check contract sizes
npm run size
```

Expected output:
```
✓ Compiled 3 Solidity files successfully
✓ Generated 10 TypeChain files
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:gateway
npm run test:dispatch

# Run tests with gas reporting
npm run test:gas

# Run tests with coverage
npm run test:coverage
```

Expected test results:
```
  PrivateTaxiDispatch
    ✓ Should register a driver
    ✓ Should request a ride
    ✓ Should submit an offer
    ...

  TaxiGateway
    ✓ Should pause the system
    ✓ Should unpause the system
    ...

  30 passing (5s)
```

## Deployment Process

### Deploy to Local Network

```bash
# Terminal 1: Start local Hardhat node
npm run node

# Terminal 2: Deploy to local network
npm run deploy:localhost
```

### Deploy to Sepolia Testnet

```bash
# Ensure you have Sepolia ETH in your wallet
# Recommended: At least 0.05 ETH for deployment and testing

# Deploy all contracts
npm run deploy:sepolia
```

Expected deployment output:

```
============================================================
Private Taxi Dispatch - Deployment Script
============================================================

Deployment Configuration:
------------------------------------------------------------
Network:        sepolia
Chain ID:       11155111
Deployer:       0xYourAddress
Balance:        0.15 ETH

Step 1: Deploying PauserSet...
------------------------------------------------------------
Pauser 1: 0xAddress1
Pauser 2: 0xAddress2
✓ PauserSet deployed to: 0xPauserSetAddress

Step 2: Deploying TaxiGateway...
------------------------------------------------------------
✓ TaxiGateway deployed to: 0xTaxiGatewayAddress

Step 3: Deploying PrivateTaxiDispatch...
------------------------------------------------------------
✓ PrivateTaxiDispatch deployed to: 0xDispatchAddress

Step 4: Configuring Gateway Access...
------------------------------------------------------------
✓ Authorized PrivateTaxiDispatch in TaxiGateway

✓ Deployment data saved to: ./deployments/sepolia/deployment.json
✓ Contract addresses saved to: ./public/contracts.json

============================================================
Deployment Summary
============================================================

Deployed Contracts:
  PauserSet:            0xPauserSetAddress
  TaxiGateway:          0xTaxiGatewayAddress
  PrivateTaxiDispatch:  0xDispatchAddress

Next Steps:
  1. Verify contracts on Etherscan:
     npm run verify:sepolia

  2. Test contract interactions:
     node scripts/interact.js

  3. Run simulation:
     node scripts/simulate.js

============================================================
```

### Deployment Files

After deployment, the following files are created:

```
deployments/
└── sepolia/
    └── deployment.json         # Full deployment information

public/
└── contracts.json              # Contract addresses for frontend
```

## Contract Verification

Verify all deployed contracts on Etherscan:

```bash
npm run verify:sepolia
```

Expected output:

```
============================================================
Private Taxi Dispatch - Contract Verification
============================================================

Network: sepolia
Chain ID: 11155111

Verifying PauserSet...
------------------------------------------------------------
Contract: 0xPauserSetAddress
✓ PauserSet verified successfully

Verifying TaxiGateway...
------------------------------------------------------------
Contract: 0xTaxiGatewayAddress
✓ TaxiGateway verified successfully

Verifying PrivateTaxiDispatch...
------------------------------------------------------------
Contract: 0xDispatchAddress
✓ PrivateTaxiDispatch verified successfully

============================================================
Verification Complete
============================================================

View on Etherscan:
  PauserSet:            https://sepolia.etherscan.io/address/0xPauserSetAddress#code
  TaxiGateway:          https://sepolia.etherscan.io/address/0xTaxiGatewayAddress#code
  PrivateTaxiDispatch:  https://sepolia.etherscan.io/address/0xDispatchAddress#code

============================================================
```

## Post-Deployment

### Test Contract Interactions

```bash
# Run interactive script
npm run interact:sepolia
```

This will:
- Display contract information
- Show current contract state
- Provide example interaction functions

### Run System Simulation

```bash
# Run full system simulation
npm run simulate:sepolia
```

This will:
1. Register multiple drivers
2. Create ride requests
3. Display system statistics
4. Show all interactions

### Update Frontend Configuration

The deployment automatically updates `public/contracts.json`:

```json
{
  "PauserSet": "0xPauserSetAddress",
  "TaxiGateway": "0xTaxiGatewayAddress",
  "PrivateTaxiDispatch": "0xDispatchAddress",
  "network": "sepolia",
  "chainId": "11155111"
}
```

### Update README with Deployment Info

Update the contract addresses table in `README.md`:

```markdown
| Contract | Address | Etherscan Link |
|----------|---------|----------------|
| **PrivateTaxiDispatch** | `0xYourAddress` | [View on Etherscan](https://sepolia.etherscan.io/address/0xYourAddress) |
| **TaxiGateway** | `0xYourAddress` | [View on Etherscan](https://sepolia.etherscan.io/address/0xYourAddress) |
| **PauserSet** | `0xYourAddress` | [View on Etherscan](https://sepolia.etherscan.io/address/0xYourAddress) |
```

## Network Information

### Sepolia Testnet

- **Network Name**: Sepolia
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR-PROJECT-ID
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucets**:
  - https://sepoliafaucet.com/
  - https://www.infura.io/faucet/sepolia

### Gas Estimates

Approximate gas costs on Sepolia:

| Operation | Gas Used | Estimated Cost (30 gwei) |
|-----------|----------|-------------------------|
| Deploy PauserSet | ~500,000 | ~0.015 ETH |
| Deploy TaxiGateway | ~800,000 | ~0.024 ETH |
| Deploy PrivateTaxiDispatch | ~2,500,000 | ~0.075 ETH |
| Register Driver | ~150,000 | ~0.0045 ETH |
| Request Ride | ~200,000 | ~0.006 ETH |
| Submit Offer | ~180,000 | ~0.0054 ETH |

**Total Deployment Cost**: ~0.12 ETH (at 30 gwei)

## Troubleshooting

### Common Issues

#### 1. "Insufficient funds for gas"

**Solution**: Ensure you have enough Sepolia ETH in your wallet.

```bash
# Check your balance
npx hardhat run scripts/check-balance.js --network sepolia
```

#### 2. "Invalid API key" during verification

**Solution**: Verify your Etherscan API key is correct in `.env`.

```bash
# Test API key
curl "https://api-sepolia.etherscan.io/api?module=account&action=balance&address=0x0000000000000000000000000000000000000000&apikey=YourApiKey"
```

#### 3. "Nonce too low"

**Solution**: Reset your account in MetaMask:
- Settings > Advanced > Reset Account

#### 4. "Contract size exceeds limit"

**Solution**: Contract sizes are monitored automatically. Check the optimization settings in `hardhat.config.ts`.

#### 5. "Network timeout"

**Solution**: Increase timeout in `hardhat.config.ts`:

```typescript
networks: {
  sepolia: {
    timeout: 120000, // 2 minutes
  }
}
```

### Verification Troubleshooting

If verification fails:

```bash
# Manual verification for a specific contract
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "Constructor" "Arguments"

# Example for PauserSet
npx hardhat verify --network sepolia 0xPauserSetAddress 0xPauser1Address 0xPauser2Address
```

### Clean and Redeploy

If you need to start fresh:

```bash
# Clean all artifacts
npm run clean

# Clean deployment files
npm run clean:deployments

# Redeploy
npm run deploy:sepolia
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile all contracts |
| `npm run typechain` | Generate TypeScript types |
| `npm test` | Run all tests |
| `npm run test:gas` | Run tests with gas reporting |
| `npm run test:coverage` | Generate coverage report |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run verify:sepolia` | Verify contracts on Etherscan |
| `npm run interact:sepolia` | Interactive contract testing |
| `npm run simulate:sepolia` | Run full system simulation |
| `npm run clean` | Clean build artifacts |

## Support

For issues and questions:
- **GitHub Issues**: [Create an issue](https://github.com/MacieNienow/PrivateTaxiDispatch/issues)
- **Documentation**: Check other `.md` files in the repository
- **Hardhat Docs**: https://hardhat.org/getting-started/

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Sepolia Testnet Information](https://sepolia.dev/)
- [Etherscan API Documentation](https://docs.etherscan.io/)
- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)

---

**Last Updated**: 2025-10-23
**Version**: 2.0.0
