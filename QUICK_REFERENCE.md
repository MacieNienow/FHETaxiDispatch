# Quick Reference Guide

## 🚀 Essential Commands

```bash
# Setup
npm install                    # Install all dependencies
cp .env.example .env          # Create environment file

# Development
npm run compile               # Compile contracts
npm test                      # Run all tests
npm run test:gas             # Test with gas reporting
npm run size                 # Check contract sizes

# Local Deployment
npm run node                 # Start local Hardhat node (Terminal 1)
npm run deploy:localhost     # Deploy to local node (Terminal 2)

# Testnet Deployment
npm run deploy:sepolia       # Deploy to Sepolia testnet

# Utilities
npm run typechain            # Generate TypeScript types
npx hardhat console          # Interactive console
```

## 📝 Contract Addresses (Update After Deployment)

```javascript
// PauserSet
const PAUSER_SET_ADDRESS = "0x...";

// TaxiGateway
const TAXI_GATEWAY_ADDRESS = "0x...";

// PrivateTaxiDispatch
const PRIVATE_TAXI_DISPATCH_ADDRESS = "0x...";
```

## 🔑 Key Contract Functions

### PrivateTaxiDispatch

```solidity
// Driver Functions
registerDriver()
updateLocation(uint32 lat, uint32 lng)
setAvailability(bool available)
submitOffer(uint32 requestId, uint32 fare, uint32 time)
completeRide(uint32 requestId, uint8 rating)

// Passenger Functions
requestRide(uint32 pickupLat, uint32 pickupLng, uint32 destLat, uint32 destLng, uint32 maxFare)
acceptOffer(uint32 requestId, uint256 offerIndex)
cancelRequest(uint32 requestId)

// View Functions
getRequestInfo(uint32 requestId)
getDriverInfo(address driver)
getSystemStats()
```

### TaxiGateway

```solidity
// Admin Functions
setDecryptionContract(address contract)

// Pauser Functions
pause()

// Owner Functions
unpause()

// View Functions
isOperational()
getGatewayStatus()
```

## 🧪 Testing Quick Reference

```javascript
// Run specific test file
npx hardhat test test/PauserSet.test.js
npx hardhat test test/TaxiGateway.test.js
npx hardhat test test/PrivateTaxiDispatch.test.js

// Run tests matching pattern
npx hardhat test --grep "registration"
npx hardhat test --grep "pause"

// Run with gas reporter
REPORT_GAS=true npx hardhat test

// Coverage report
npx hardhat coverage
```

## 🔐 FHE Operations

```javascript
// Frontend encryption example
const fheUtils = new FHEUtils();
await fheUtils.init(provider);

// Encrypt coordinates
const lat = fheUtils.coordinateToUint32(40.758896);
const lng = fheUtils.coordinateToUint32(-73.985130);
const encLat = await fheUtils.encryptUint32(lat);
const encLng = await fheUtils.encryptUint32(lng);

// Send to contract
await contract.updateLocation(encLat, encLng);
```

## 📊 Project Structure

```
├── contracts/              # Solidity contracts
│   ├── PrivateTaxiDispatch.sol
│   ├── TaxiGateway.sol
│   ├── PauserSet.sol
│   └── test/              # Mock contracts
├── deploy/                # Deployment scripts
├── test/                  # Test files
├── public/                # Frontend
│   ├── index.html
│   ├── app.js
│   └── fhe-utils.js
├── typechain-types/       # Generated types
└── hardhat.config.js
```

## 🌐 Network Configuration

### Local (Hardhat)
- Chain ID: 31337
- RPC: http://127.0.0.1:8545

### Sepolia Testnet
- Chain ID: 11155111
- RPC: https://sepolia.infura.io/v3/...
- Explorer: https://sepolia.etherscan.io

## 🛠️ Troubleshooting

### Contract too large
```javascript
// hardhat.config.js
optimizer: { enabled: true, runs: 200 }
```

### Tests failing
```bash
# Clear cache
npx hardhat clean
npm run compile
npm test
```

### MetaMask issues
- Reset account in Settings > Advanced > Reset Account
- Clear activity tab data
- Check network configuration

## 📚 Documentation Files

- `README.md` - Project overview
- `DEVELOPMENT.md` - Full development guide
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `QUICK_REFERENCE.md` - This file

## 🔗 Important Links

- Hardhat: https://hardhat.org/docs
- Zama FHEVM: https://docs.zama.ai/fhevm
- Ethers.js: https://docs.ethers.org/
- Sepolia Faucet: https://sepoliafaucet.com/

## ⚡ Quick Deploy Checklist

- [ ] Install dependencies: `npm install`
- [ ] Configure `.env` file
- [ ] Compile contracts: `npm run compile`
- [ ] Run tests: `npm test`
- [ ] Check contract sizes: `npm run size`
- [ ] Deploy: `npm run deploy:sepolia`
- [ ] Update frontend addresses
- [ ] Verify contracts on Etherscan
- [ ] Test frontend integration

## 🎯 Common Tasks

### Add a new test
1. Create file in `test/`
2. Follow existing test patterns
3. Run: `npx hardhat test test/YourTest.test.js`

### Deploy to new network
1. Add network to `hardhat.config.js`
2. Configure `.env` with RPC URL
3. Run: `npx hardhat deploy --network yournetwork`

### Generate contract types
```bash
npm run compile
npm run typechain
```

### Verify contract
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS "constructor" "args"
```

## 💡 Pro Tips

1. Always run tests before deploying
2. Use `--gas-reporter` to optimize
3. Keep private keys secure (never commit)
4. Use named accounts in hardhat-deploy
5. Test on local network first
6. Document all contract changes
7. Keep dependencies updated
8. Use events for debugging
9. Implement proper error handling
10. Follow Solidity style guide

---

**Last Updated**: 2025-10-23
