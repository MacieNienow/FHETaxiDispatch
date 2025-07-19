# Quick Start Guide: Private Taxi Dispatch with FHE Gateway

## Prerequisites

- Node.js >= 14.0.0
- npm or yarn
- MetaMask or Web3 wallet
- Test ETH on Sepolia testnet

## Installation

### 1. Clone and Setup

```bash
cd D:\

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
notepad .env
```

**Required Configuration:**

```env
# Pauser addresses (KMS nodes + Coprocessors)
NUM_PAUSERS=3
PAUSER_ADDRESS_0=0xYourKMSNode1Address
PAUSER_ADDRESS_1=0xYourKMSNode2Address
PAUSER_ADDRESS_2=0xYourCoprocessorAddress

# KMS Generation contract
KMS_GENERATION_ADDRESS=0xYourKMSGenerationAddress

# Deployment configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc.sepolia.org
CHAIN_ID=11155111
```

## Deployment

### Option 1: Hardhat (Recommended)

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat (if not already)
npx hardhat init

# Compile contracts
npx hardhat compile

# Deploy
npm run deploy
```

### Option 2: Foundry

```bash
# Install Foundry (if not already)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Build contracts
forge build

# Deploy PauserSet
forge create contracts/PauserSet.sol:PauserSet \
  --constructor-args "[0xPauser1,0xPauser2,0xPauser3]" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# Deploy TaxiGateway
forge create contracts/TaxiGateway.sol:TaxiGateway \
  --constructor-args $PAUSER_SET_ADDRESS $KMS_GENERATION_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# Deploy PrivateTaxiDispatch
forge create contracts/PrivateTaxiDispatch.sol:PrivateTaxiDispatch \
  --constructor-args $GATEWAY_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL
```

## Testing

### Run Test Suite

```bash
# Test gateway functionality
npm run test:gateway
```

### Manual Testing

```bash
# Start Hardhat console
npx hardhat console --network sepolia

# Get contract instances
const PauserSet = await ethers.getContractAt("PauserSet", "0xYourPauserSetAddress");
const Gateway = await ethers.getContractAt("TaxiGateway", "0xYourGatewayAddress");
const TaxiDispatch = await ethers.getContractAt("PrivateTaxiDispatch", "0xYourTaxiDispatchAddress");

# Test gateway status
await Gateway.isOperational();
// Should return: true

# Test pauser count
await Gateway.getPauserCount();
// Should return: 3 (or your NUM_PAUSERS value)

# Test system operational
await TaxiDispatch.isSystemOperational();
// Should return: true
```

## Verification

### Verify Contracts on Etherscan

```bash
# Verify PauserSet
npx hardhat verify --network sepolia \
  0xYourPauserSetAddress \
  "[\"0xPauser1\",\"0xPauser2\",\"0xPauser3\"]"

# Verify TaxiGateway
npx hardhat verify --network sepolia \
  0xYourGatewayAddress \
  "0xYourPauserSetAddress" \
  "0xYourKMSGenerationAddress"

# Verify PrivateTaxiDispatch
npx hardhat verify --network sepolia \
  0xYourTaxiDispatchAddress \
  "0xYourGatewayAddress"
```

## Usage Examples

### Register as a Driver

```javascript
const tx = await taxiDispatch.registerDriver();
await tx.wait();
console.log("Driver registered!");
```

### Update Driver Location (Encrypted)

```javascript
// Encrypt coordinates using FHE
const latitude = 40123456;  // Encoded as uint32
const longitude = -73987654;

const tx = await taxiDispatch.updateLocation(latitude, longitude);
await tx.wait();
console.log("Location updated!");
```

### Request a Ride

```javascript
const pickupLat = 40123456;
const pickupLng = -73987654;
const destLat = 40234567;
const destLng = -73876543;
const maxFare = 5000; // In wei or smallest unit

const tx = await taxiDispatch.requestRide(
  pickupLat,
  pickupLng,
  destLat,
  destLng,
  maxFare
);
await tx.wait();
console.log("Ride requested!");
```

### Submit Driver Offer

```javascript
const requestId = 1;
const proposedFare = 4500;
const estimatedTime = 15; // minutes

const tx = await taxiDispatch.submitOffer(
  requestId,
  proposedFare,
  estimatedTime
);
await tx.wait();
console.log("Offer submitted!");
```

### Check System Status

```javascript
// Check if system is operational
const operational = await taxiDispatch.isSystemOperational();
console.log("System operational:", operational);

// Check if driver is available
const available = await taxiDispatch.isDriverAvailable("0xDriverAddress");
console.log("Driver available:", available);

// Check if request is active
const active = await taxiDispatch.isRequestActive(1);
console.log("Request active:", active);
```

## Common Commands

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy all contracts
npm run deploy

# Test gateway
npm run test:gateway

# Run local node (for development)
npx hardhat node

# Deploy to local node
npx hardhat run scripts/deploy-with-gateway.js --network localhost

# Deploy to Sepolia
npx hardhat run scripts/deploy-with-gateway.js --network sepolia
```

## Troubleshooting

### Issue: "Invalid gateway address"

**Solution:** Deploy TaxiGateway before PrivateTaxiDispatch

```bash
# Correct order:
# 1. Deploy PauserSet
# 2. Deploy TaxiGateway
# 3. Deploy PrivateTaxiDispatch
```

### Issue: "Not authorized pauser"

**Solution:** Verify pauser addresses in PauserSet

```javascript
const isPauser = await pauserSet.isPauser("0xYourAddress");
console.log("Is pauser:", isPauser);
```

### Issue: "System paused by gateway"

**Solution:** Check gateway status and unpause if needed

```javascript
const operational = await gateway.isOperational();
if (!operational) {
  // Only owner can unpause
  await gateway.unpause();
}
```

### Issue: "Insufficient balance"

**Solution:** Get test ETH from Sepolia faucet

- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

## Project Structure

```

├── contracts/
│   ├── PauserSet.sol              # Immutable pauser management
│   ├── TaxiGateway.sol            # Gateway with pause control
│   └── PrivateTaxiDispatch.sol    # Main taxi dispatch contract
├── scripts/
│   ├── deploy-with-gateway.js     # Deployment script
│   └── test-gateway.js            # Test script
├── public/
│   ├── index.html                 # Frontend UI
│   ├── app.js                     # Frontend logic
│   └── manifest.json              # PWA manifest
├── .env.example                    # Environment template
├── package.json                    # NPM configuration
├── README.md                       # Project overview
├── MIGRATION_GUIDE.md             # Detailed migration guide
├── GATEWAY_UPDATE.md              # Feature overview
├── IMPLEMENTATION_SUMMARY.md      # Implementation details
└── QUICKSTART.md                  # This file
```

## Next Steps

1. **Read Documentation**
   - `MIGRATION_GUIDE.md` for detailed migration steps
   - `GATEWAY_UPDATE.md` for feature overview
   - `IMPLEMENTATION_SUMMARY.md` for technical details

2. **Test on Testnet**
   - Deploy to Sepolia
   - Test all functionality
   - Verify contracts

3. **Integrate Frontend**
   - Update contract addresses
   - Test wallet connectivity
   - Verify encrypted operations

4. **Security Audit**
   - Review contract code
   - Test edge cases
   - Prepare for production

## Support

- **Documentation**: See other `.md` files in this directory
- **Issues**: Create an issue on GitHub
- **Community**: Join our Discord/Telegram

## Resources

- **Zama FHEVM**: https://docs.zama.ai/fhevm
- **Hardhat**: https://hardhat.org/
- **Foundry**: https://book.getfoundry.sh/
- **Ethers.js**: https://docs.ethers.org/

---

**Last Updated**: 2025-10-23
**Version**: 2.0.0
**Status**: Ready for Deployment
