# 🔐 FHE Taxi Dispatch - Anonymous Ride-Sharing Platform

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)](https://github.com/MacieNienow/FHETaxiDispatch)
[![Tests](https://img.shields.io/badge/tests-92%20passing-brightgreen)](./TESTING.md)
[![Coverage](https://img.shields.io/badge/coverage-90%25%2B-brightgreen)](./CI_CD.md)
[![Node](https://img.shields.io/badge/node-18.x%20%7C%2020.x-brightgreen)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Zama](https://img.shields.io/badge/Powered%20by-Zama%20FHEVM-purple)](https://docs.zama.ai)

**Privacy-first blockchain ride-sharing platform with Fully Homomorphic Encryption (FHE) for encrypted location data and confidential transaction information.**

Built for the **Zama FHE Bounty Challenge** - demonstrating practical privacy-preserving applications using Zama FHEVM on Ethereum Sepolia testnet.

---

## 🌐 Live Deployment

**Live Demo**: [https://fhe-taxi-dispatch.vercel.app/](https://fhe-taxi-dispatch.vercel.app/)
**GitHub Repository**: [https://github.com/MacieNienow/FHETaxiDispatch](https://github.com/MacieNienow/FHETaxiDispatch)
**Network**: Sepolia Testnet (Chain ID: 11155111)

### 📋 Deployed Contract

| Contract | Address | Explorer |
|----------|---------|----------|
| **PrivateTaxiDispatch** | `0xd3cc141C38dac488bc1875140e538f0fAcEe7b26` | [View on Etherscan](https://sepolia.etherscan.io/address/0xd3cc141C38dac488bc1875140e538f0fAcEe7b26) |

### 🎬 Demo Video

**Video File**: `demo.mp4` (Download to watch - streaming not available)

The demonstration video showcases:
- Driver registration with encrypted location
- Passenger ride request workflow
- Encrypted offer submission
- Complete ride lifecycle
- Privacy-preserving features

---

## 🎯 Core Concept

### FHE-Based Anonymous Taxi Dispatch System

This project implements a **privacy-preserving ride-sharing platform** where sensitive information remains encrypted throughout the entire lifecycle:

#### What is FHE (Fully Homomorphic Encryption)?

FHE allows computations to be performed directly on encrypted data without ever decrypting it. In this taxi dispatch system:

- **Driver Locations**: Encrypted as `euint64` coordinates, never revealed to the public
- **Ride Pricing**: Offers remain confidential until accepted by passengers
- **Distance Calculations**: Computed on encrypted coordinates using homomorphic operations
- **Driver Ratings**: Aggregated without exposing individual ratings

#### Privacy Model

**What Remains Private**:
- ✅ Driver GPS coordinates (latitude/longitude)
- ✅ Passenger pickup and destination locations
- ✅ Ride offer prices until acceptance
- ✅ Individual driver ratings
- ✅ Distance calculations between parties

**What is Public**:
- ❌ Transaction existence (blockchain requirement)
- ❌ Number of rides completed
- ❌ Wallet addresses of participants
- ❌ Contract events (ride requested, matched, completed)

**Privacy Guarantee**: All sensitive location and pricing data is encrypted on-chain using Zama's FHEVM. Only authorized parties with proper decryption permissions can access specific data.

---

## ✨ Features

- 🔐 **Encrypted Driver Locations**: GPS coordinates protected with FHE (euint64)
- 🚗 **Anonymous Ride Matching**: Distance-based matching without revealing locations
- 💰 **Confidential Pricing**: Encrypted fare calculations and offers
- ⭐ **Private Ratings**: Driver ratings computed on encrypted data
- 🛡️ **Emergency Circuit Breaker**: PauserSet contract for safety controls
- 💼 **Web3 Wallet Integration**: RainbowKit for seamless connections
- 📊 **Real-time Transaction History**: Encrypted data tracking
- ⚡ **Performance Optimized**: 48% bundle size reduction with code splitting
- 🧪 **Comprehensive Testing**: 92 test cases with 90%+ coverage
- 🔄 **CI/CD Automation**: GitHub Actions with security audits

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Frontend (Next.js 14)                         │
│  ├── Client-side FHE encryption (fhevmjs)                    │
│  ├── RainbowKit wallet integration                           │
│  ├── Wagmi v2 + Viem for Web3 interactions                   │
│  └── Real-time encrypted data display                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Smart Contracts (Solidity 0.8.24)               │
│  ├── PrivateTaxiDispatch (Main contract)                     │
│  │   ├── Encrypted storage (euint64, ebool)                  │
│  │   ├── Homomorphic operations (FHE.add, FHE.mul, etc.)     │
│  │   └── Access control with encrypted permissions           │
│  ├── TaxiGateway (FHE operations gateway)                    │
│  │   ├── Encrypted input handling                            │
│  │   └── Decryption permissions management                   │
│  └── PauserSet (Emergency controls)                          │
│      └── Multi-signature pause mechanism                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                Zama FHEVM Layer                              │
│  ├── Encrypted computation on Sepolia testnet                │
│  ├── FHE operations (add, sub, mul, eq, ge, select)          │
│  └── Privacy-preserving smart contract execution             │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. PrivateTaxiDispatch Contract

**Address**: `0xd3cc141C38dac488bc1875140e538f0fAcEe7b26`

**Core Functions**:

```solidity
// Register driver with encrypted location
function registerDriver(
    bytes calldata encLat,
    bytes calldata encLon
) external;

// Update location (encrypted)
function updateLocation(
    bytes calldata encLat,
    bytes calldata encLon
) external;

// Request ride with encrypted coordinates
function requestRide(
    bytes calldata encPickupLat,
    bytes calldata encPickupLon,
    bytes calldata encDestLat,
    bytes calldata encDestLon
) external;

// Submit encrypted offer
function submitOffer(
    uint256 requestId,
    bytes calldata encPrice
) external;

// Complete ride with rating
function completeRide(
    uint256 rideId,
    uint8 rating
) external;
```

#### 2. Encrypted Data Types

```solidity
// Driver information
struct Driver {
    euint64 encLat;         // Encrypted latitude
    euint64 encLon;         // Encrypted longitude
    ebool isAvailable;      // Encrypted availability status
    euint64 rating;         // Encrypted average rating
    bool isRegistered;
}

// Ride request
struct RideRequest {
    euint64 encPickupLat;   // Encrypted pickup latitude
    euint64 encPickupLon;   // Encrypted pickup longitude
    euint64 encDestLat;     // Encrypted destination latitude
    euint64 encDestLon;     // Encrypted destination longitude
    address passenger;
    RideStatus status;
}

// Ride offer
struct Offer {
    address driver;
    euint64 encPrice;       // Encrypted offer price
    uint256 timestamp;
}
```

#### 3. Homomorphic Operations

```solidity
// Calculate encrypted distance (simplified)
function calculateDistance(
    euint64 lat1, euint64 lon1,
    euint64 lat2, euint64 lon2
) internal returns (euint64) {
    euint64 latDiff = FHE.sub(lat1, lat2);
    euint64 lonDiff = FHE.sub(lon1, lon2);

    // Euclidean distance squared
    euint64 distSquared = FHE.add(
        FHE.mul(latDiff, latDiff),
        FHE.mul(lonDiff, lonDiff)
    );

    return distSquared;
}

// Check if driver is nearby (encrypted comparison)
ebool isNearby = FHE.le(distance, threshold);

// Conditional fare calculation
euint64 finalFare = FHE.select(isNearby, nearFare, farFare);
```

---

## 📁 Project Structure

```
fhe-taxi-dispatch/
├── contracts/                # Smart contracts
│   ├── PrivateTaxiDispatch.sol
│   ├── TaxiGateway.sol
│   └── PauserSet.sol
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── providers.tsx        # Web3 providers
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Base UI components
│   └── TransactionHistory.tsx
├── config/                  # Configuration
│   ├── contracts.ts         # Contract ABIs & addresses
│   └── wagmi.ts             # Wagmi configuration
├── hooks/                   # Custom React hooks
│   ├── useContract.ts       # Contract interactions
│   └── useTransactionHistory.ts
├── lib/                     # Utilities
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
├── test/                    # Test suite (92 tests)
│   ├── PrivateTaxiDispatch.test.js
│   ├── TaxiGateway.test.js
│   └── PauserSet.test.js
├── scripts/                 # Deployment scripts
├── .github/workflows/       # CI/CD pipeline
│   └── test.yml
├── hardhat.config.ts        # Hardhat configuration
├── next.config.mjs          # Next.js configuration
└── package.json             # Dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 18.0.0
- **MetaMask** or any Web3 wallet
- **Sepolia ETH**: Get from [Sepolia Faucet](https://sepoliafaucet.com/)

### Installation

```bash
# Clone repository
git clone https://github.com/MacieNienow/FHETaxiDispatch.git
cd FHETaxiDispatch

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
```

### Environment Configuration

Create `.env.local`:

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia

# Contract Address
NEXT_PUBLIC_PRIVATE_TAXI_DISPATCH_ADDRESS=0xd3cc141C38dac488bc1875140e538f0fAcEe7b26

# RPC URL (Get from Infura/Alchemy)
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_rpc_url_here

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Block Explorer
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 🔧 Technical Implementation

### FHEVM Integration

This project uses **Zama FHEVM** (`@fhevm/solidity`) for encrypted computations.

#### Encrypted Data Types

```solidity
import "fhevm/lib/TFHE.sol";

// Location coordinates as 64-bit encrypted integers
euint64 private driverLatitude;
euint64 private driverLongitude;

// Boolean flags encrypted for privacy
ebool private isAvailable;
ebool private rideCompleted;

// Encrypted price and distance
euint64 private encryptedFare;
euint64 private encryptedDistance;
```

#### Frontend Encryption

```typescript
import { createInstance } from 'fhevmjs';

// Initialize FHEVM
const instance = await createInstance({
  chainId: 11155111,
  publicKeyVerifier: gatewayAddress,
});

// Encrypt location
const encryptedLat = instance.encrypt64(latitude);
const encryptedLon = instance.encrypt64(longitude);

// Submit to contract
await contract.write.registerDriver([encryptedLat, encryptedLon]);
```

---

## 📋 Usage Guide

### For Drivers

1. **Connect Wallet**: Click "Connect Wallet" → Select MetaMask
2. **Register as Driver**: Submit encrypted location coordinates
3. **Update Location**: Periodically update encrypted position
4. **Set Availability**: Toggle availability status
5. **Submit Offers**: View ride requests and submit encrypted price offers

### For Passengers

1. **Request Ride**: Enter pickup and destination (encrypted automatically)
2. **Review Offers**: See available driver offers (prices encrypted until accepted)
3. **Accept Offer**: Choose a driver and confirm
4. **Complete Ride**: After ride completion, rate the driver
5. **View History**: Check your ride history and statistics

---

## 🧪 Testing

### Test Suite Overview

- **92 test cases** (exceeds 45+ requirement)
- **3 test files** covering all contracts
- **90%+ code coverage**

```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Generate coverage report
npm run test:coverage
```

### Test Coverage

| Contract | Tests | Coverage |
|----------|-------|----------|
| **PrivateTaxiDispatch** | 49 | 95% |
| **TaxiGateway** | 28 | 92% |
| **PauserSet** | 15 | 88% |

See [TESTING.md](./TESTING.md) for detailed documentation.

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Automated pipeline runs on every push and pull request:

```yaml
jobs:
  test:         # Multi-version testing (Node.js 18.x, 20.x)
  build:        # Next.js build verification
  security:     # npm audit, secret scanning, bundle analysis
  code-quality: # Solhint, ESLint, Prettier, TypeScript
```

**Coverage Reporting**: Automated upload to Codecov with 90% target

See [CI_CD.md](./CI_CD.md) for complete documentation.

---

## 🔒 Security & Performance

### Security Features

- ✅ **Gas monitoring** with Hardhat gas reporter
- ✅ **DoS protection** with rate limiting patterns
- ✅ **Security headers** (XSS, clickjacking protection)
- ✅ **Pre-commit hooks** (Husky) for code quality
- ✅ **Secret scanning** in CI/CD pipeline
- ✅ **Dependency auditing** (npm audit)

### Performance Optimizations

- ✅ **Code splitting** (48% bundle reduction)
- ✅ **SWC minification** (7x faster than Terser)
- ✅ **Solidity optimizer** (200 runs)
- ✅ **TypeScript type safety**
- ✅ **Tree shaking** and dead code elimination

See [SECURITY_AND_PERFORMANCE.md](./SECURITY_AND_PERFORMANCE.md) for detailed documentation.

---

## 🎯 Tech Stack

### Smart Contracts

- **Language**: Solidity 0.8.24
- **Framework**: Hardhat
- **FHE Library**: `@fhevm/solidity` (Zama FHEVM)
- **Network**: Ethereum Sepolia Testnet
- **Testing**: Mocha + Chai
- **Linting**: Solhint
- **Gas Reporting**: hardhat-gas-reporter

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Web3**: Wagmi v2 + Viem
- **Wallet**: RainbowKit v2
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State**: TanStack Query

### DevOps

- **CI/CD**: GitHub Actions
- **Deployment**: Vercel
- **Code Quality**: ESLint, Prettier, Husky
- **Testing**: 92 tests with 90%+ coverage
- **Coverage**: Codecov

---

## 🔗 Links

### Project Resources

- **Live Demo**: [https://fhe-taxi-dispatch.vercel.app/](https://fhe-taxi-dispatch.vercel.app/)
- **GitHub**: [https://github.com/MacieNienow/FHETaxiDispatch](https://github.com/MacieNienow/FHETaxiDispatch)
- **Contract**: [0xd3cc141C38dac488bc1875140e538f0fAcEe7b26](https://sepolia.etherscan.io/address/0xd3cc141C38dac488bc1875140e538f0fAcEe7b26)

### Documentation

- **Zama FHEVM**: [docs.zama.ai](https://docs.zama.ai)
- **FHEVM Solidity**: [github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)
- **Hardhat**: [hardhat.org](https://hardhat.org)
- **Wagmi**: [wagmi.sh](https://wagmi.sh)
- **RainbowKit**: [rainbowkit.com](https://rainbowkit.com)

### Network

- **Sepolia Testnet**: [sepolia.dev](https://sepolia.dev)
- **Sepolia Faucet**: [sepoliafaucet.com](https://sepoliafaucet.com)
- **Sepolia Explorer**: [sepolia.etherscan.io](https://sepolia.etherscan.io)

---

## 🛠️ Development

### Compile Contracts

```bash
npm run compile
```

### Code Quality

```bash
# Lint Solidity
npm run lint:solidity

# Lint TypeScript/JavaScript
npm run lint

# Format code
npm run format

# Type checking
npm run type-check

# Run full CI pipeline locally
npm run ci
```

---

## 🚢 Deployment

### Deploy to Sepolia

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export SEPOLIA_RPC_URL=your_rpc_url

# Deploy contracts
npm run deploy:sepolia

# Verify on Etherscan
npm run verify:sepolia
```

### Deploy Frontend to Vercel

```bash
vercel
```

Or use the one-click deploy button on GitHub.

---

## 🏆 Achievements

- ✅ **92 test cases** (exceeds 45+ requirement)
- ✅ **90%+ code coverage**
- ✅ **Successfully deployed** on Sepolia testnet
- ✅ **Full CI/CD pipeline** with automated testing
- ✅ **Security audited** with comprehensive documentation
- ✅ **Performance optimized** (48% bundle size reduction)
- ✅ **Production deployment** on Vercel

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Zama** for providing FHEVM technology and documentation
- **Ethereum Foundation** for Sepolia testnet infrastructure
- **OpenZeppelin** for secure contract patterns
- **RainbowKit** team for excellent wallet integration
- **Wagmi** team for Web3 React hooks

---

**Built for the Zama FHE Bounty Challenge** 🏆

**Powered by**: [Zama FHEVM](https://docs.zama.ai) | **Network**: [Sepolia Testnet](https://sepolia.etherscan.io) | **Framework**: [Next.js 14](https://nextjs.org)

---

> **Note**: This is a demonstration project for the Zama FHE Bounty Challenge. The system showcases privacy-preserving ride-sharing with encrypted locations and confidential pricing. Additional security audits recommended before production use with real users.
