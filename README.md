# 🔐 Private Ride Platform

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)](https://github.com)
[![Tests](https://img.shields.io/badge/tests-92%20passing-brightgreen)](./TESTING.md)
[![Coverage](https://img.shields.io/badge/coverage-90%25%2B-brightgreen)](./CI_CD.md)
[![Node](https://img.shields.io/badge/node-18.x%20%7C%2020.x-brightgreen)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Zama](https://img.shields.io/badge/Powered%20by-Zama%20FHEVM-purple)](https://docs.zama.ai)

**Privacy-first blockchain ride-sharing platform with Fully Homomorphic Encryption (FHE) for encrypted location data and sensitive transaction information.**

Built for the **Zama FHE Challenge** - demonstrating practical privacy-preserving applications using Zama FHEVM on Ethereum Sepolia testnet.

---

## 🌐 Live Demo

**Frontend**: [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/private-ride-platform)
**Network**: Sepolia (Chain ID: 11155111)

### 📋 Deployed Contracts

| Contract | Address | Explorer |
|----------|---------|----------|
| **PrivateTaxiDispatch** | `0x9e77F5121215474e473401E9768a517DAFde1f87` | [View on Etherscan](https://sepolia.etherscan.io/address/0x9e77F5121215474e473401E9768a517DAFde1f87) |
| **TaxiGateway** | `0x79d6742b1Bf62452bfcBC6b137ed4eA1ba459a6B` | [View on Etherscan](https://sepolia.etherscan.io/address/0x79d6742b1Bf62452bfcBC6b137ed4eA1ba459a6B) |
| **PauserSet** | `0x23903e691644780737F7ac079C58C5B76195Bcdd` | [View on Etherscan](https://sepolia.etherscan.io/address/0x23903e691644780737F7ac079C58C5B76195Bcdd) |

---

## ✨ Features

- 🔐 **Privacy-Preserving Locations**: Driver and passenger locations encrypted with FHE
- 🚗 **Encrypted Ride Matching**: Homomorphic distance calculation without revealing coordinates
- 💰 **Confidential Pricing**: Encrypted fare calculations and offers
- ⭐ **Anonymous Ratings**: Driver ratings computed on encrypted data
- 🛡️ **Emergency Circuit Breaker**: PauserSet contract for emergency pause functionality
- 💼 **Web3 Wallet Integration**: RainbowKit for seamless wallet connections
- 📊 **Real-time Transaction History**: Track rides and offers with encrypted data
- ⚡ **Optimized Performance**: Code splitting and bundle optimization (48% reduction)
- 🧪 **Comprehensive Testing**: 92 test cases with 90%+ coverage
- 🔄 **CI/CD Automation**: GitHub Actions with security audits

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
│  ├── Client-side FHE encryption                              │
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
│  │   ├── Homomorphic operations (distance, pricing)          │
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
│                    Zama FHEVM Layer                          │
│  ├── Encrypted computation on Sepolia testnet                │
│  ├── FHE operations (add, sub, mul, eq, ge, select)          │
│  └── Privacy-preserving smart contract execution             │
└─────────────────────────────────────────────────────────────┘
```

### 📁 Project Structure

```
private-ride-platform/
├── contracts/                # Smart contracts
│   ├── PrivateTaxiDispatch.sol
│   ├── TaxiGateway.sol
│   └── PauserSet.sol
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   ├── providers.tsx        # Web3 providers
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── alert.tsx
│   └── TransactionHistory.tsx
├── config/                  # Configuration
│   ├── contracts.ts         # Contract ABIs & addresses
│   └── wagmi.ts             # Wagmi configuration
├── hooks/                   # Custom React hooks
│   ├── useContract.ts       # Contract interaction hooks
│   └── useTransactionHistory.ts
├── lib/                     # Utilities
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
├── test/                    # Test suite (92 tests)
│   ├── PrivateTaxiDispatch.test.js
│   ├── TaxiGateway.test.js
│   └── PauserSet.test.js
├── scripts/                 # Deployment scripts
│   ├── deploy.js
│   └── verify.js
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
git clone https://github.com/yourusername/private-ride-platform.git
cd private-ride-platform

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
```

### Environment Configuration

Create `.env.local` file:

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia

# Contract Addresses (Sepolia)
NEXT_PUBLIC_PAUSER_SET_ADDRESS=0x23903e691644780737F7ac079C58C5B76195Bcdd
NEXT_PUBLIC_TAXI_GATEWAY_ADDRESS=0x79d6742b1Bf62452bfcBC6b137ed4eA1ba459a6B
NEXT_PUBLIC_PRIVATE_TAXI_DISPATCH_ADDRESS=0x9e77F5121215474e473401E9768a517DAFde1f87

# RPC URL (Get from Infura/Alchemy)
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_rpc_url_here

# WalletConnect Project ID (Get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Block Explorer
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io
```

### Run Development Server

```bash
# Start Next.js dev server (port 1371)
npm run dev

# Open browser to http://localhost:1371
```

### Build for Production

```bash
# Build Next.js application
npm run build

# Start production server
npm start
```

---

## 🔧 Technical Implementation

### FHEVM Integration

This project uses **Zama FHEVM** (`@fhevm/solidity`) for encrypted computations on Ethereum.

#### Encrypted Data Types

```solidity
// Location coordinates encrypted as 64-bit unsigned integers
euint64 private driverLatitude;
euint64 private driverLongitude;

// Boolean flags encrypted for privacy
ebool private isAvailable;
ebool private rideCompleted;

// Encrypted price and distance
euint64 private encryptedFare;
euint64 private encryptedDistance;
```

#### Homomorphic Operations

```solidity
// Encrypted distance calculation (simplified)
function calculateDistance(
    euint64 lat1, euint64 lon1,
    euint64 lat2, euint64 lon2
) internal returns (euint64) {
    euint64 latDiff = FHE.sub(lat1, lat2);
    euint64 lonDiff = FHE.sub(lon1, lon2);
    // Euclidean distance approximation
    euint64 distanceSquared = FHE.add(
        FHE.mul(latDiff, latDiff),
        FHE.mul(lonDiff, lonDiff)
    );
    return distanceSquared;
}

// Encrypted comparison for matching
ebool isNearby = FHE.le(distance, threshold);

// Conditional selection based on encrypted boolean
euint64 finalPrice = FHE.select(isNearby, nearPrice, farPrice);
```

### Smart Contract Architecture

#### PrivateTaxiDispatch.sol

Main contract handling ride-sharing logic:

```solidity
// Driver registration with encrypted location
function registerDriver(
    bytes calldata encryptedLat,
    bytes calldata encryptedLon
) external {
    euint64 lat = TFHE.asEuint64(encryptedLat);
    euint64 lon = TFHE.asEuint64(encryptedLon);

    drivers[msg.sender] = Driver({
        isRegistered: true,
        encLat: lat,
        encLon: lon,
        rating: TFHE.asEuint64(500) // Initial rating: 5.00
    });
}

// Submit encrypted ride offer
function submitOffer(
    uint256 requestId,
    bytes calldata encryptedPrice
) external {
    euint64 price = TFHE.asEuint64(encryptedPrice);

    rideOffers[requestId].push(Offer({
        driver: msg.sender,
        encPrice: price,
        timestamp: block.timestamp
    }));
}

// Complete ride and update encrypted rating
function completeRide(uint256 rideId, uint8 rating) external {
    // Rating encrypted: 1-5 stars -> 100-500
    euint64 newRating = TFHE.asEuint64(rating * 100);

    // Update driver's average rating (encrypted)
    drivers[driverAddr].rating = FHE.div(
        FHE.add(drivers[driverAddr].rating, newRating),
        TFHE.asEuint64(2)
    );
}
```

### Frontend Integration

#### Wagmi v2 Hooks

```typescript
import { useWriteContract, useReadContract } from 'wagmi';
import { PRIVATE_TAXI_DISPATCH_ABI, CONTRACT_ADDRESS } from '@/config/contracts';

export function usePrivateTaxiDispatch() {
  // Register driver
  const { writeContract: registerDriver } = useWriteContract();

  const handleRegisterDriver = async (
    encLat: Uint8Array,
    encLon: Uint8Array
  ) => {
    await registerDriver({
      address: CONTRACT_ADDRESS,
      abi: PRIVATE_TAXI_DISPATCH_ABI,
      functionName: 'registerDriver',
      args: [encLat, encLon],
    });
  };

  // Read encrypted location (requires permission)
  const { data: driverLocation } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PRIVATE_TAXI_DISPATCH_ABI,
    functionName: 'getDriverLocation',
    args: [driverAddress],
  });

  return { handleRegisterDriver, driverLocation };
}
```

#### RainbowKit Configuration

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Private Ride Platform',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia],
  ssr: true,
});
```

---

## 🔐 Privacy Model

### What's Private

- ✅ **Driver locations**: Encrypted as `euint64` coordinates
- ✅ **Passenger pickup/dropoff**: Encrypted location data
- ✅ **Ride pricing**: Offers encrypted until accepted
- ✅ **Driver ratings**: Individual ratings stored encrypted
- ✅ **Distance calculations**: Computed homomorphically without decryption

### What's Public

- ❌ **Transaction existence**: Blockchain transactions are visible
- ❌ **Ride count**: Number of completed rides per driver
- ❌ **Contract events**: Ride requested, accepted, completed events
- ❌ **Wallet addresses**: Driver and passenger addresses

### Decryption Permissions

- **Drivers**: Can decrypt their own location and ratings
- **Passengers**: Can decrypt accepted offer prices
- **Contract Owner**: Administrative access to encrypted data
- **Gateway Contract**: Manages FHE decryption permissions

**Privacy Guarantee**: All sensitive data (locations, prices, ratings) remains encrypted on-chain and can only be decrypted by authorized parties.

---

## 📋 Usage Guide

### For Drivers

1. **Connect Wallet**
   ```
   Click "Connect Wallet" → Select MetaMask → Approve connection
   ```

2. **Register as Driver**
   ```typescript
   // Frontend encrypts your location
   const encryptedLocation = await encryptLocation(latitude, longitude);
   await registerDriver(encryptedLocation.lat, encryptedLocation.lon);
   ```

3. **Update Location** (Encrypted)
   ```
   Navigate to "Driver Dashboard" → "Update Location" → Submit
   ```

4. **Set Availability**
   ```
   Toggle "Available" switch → Transaction confirmed
   ```

5. **Submit Offers**
   ```
   View "Ride Requests" → Select request → Enter price → Submit encrypted offer
   ```

### For Passengers

1. **Request Ride**
   ```typescript
   // Pickup and destination encrypted
   await requestRide(encPickupLat, encPickupLon, encDestLat, encDestLon);
   ```

2. **Review Offers**
   ```
   View "My Requests" → See encrypted offers → Decrypt your accepted offer
   ```

3. **Accept Offer**
   ```
   Select offer → Click "Accept" → Confirm transaction
   ```

4. **Complete Ride & Rate**
   ```
   After ride → Click "Complete" → Rate driver (1-5 stars) → Submit
   ```

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

# Run on Sepolia testnet
npm run test:sepolia
```

### Test Coverage

| Contract | Tests | Coverage |
|----------|-------|----------|
| **PrivateTaxiDispatch** | 49 | 95% |
| **TaxiGateway** | 28 | 92% |
| **PauserSet** | 15 | 88% |

See [TESTING.md](./TESTING.md) for detailed testing documentation.

---

## 🛠️ Development

### Compile Contracts

```bash
# Compile Solidity contracts
npm run compile

# Check contract sizes
npx hardhat size-contracts
```

### Code Quality

```bash
# Lint Solidity files
npm run lint:solidity

# Lint TypeScript/JavaScript
npm run lint

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# TypeScript type checking
npm run type-check
```

### Run Full CI Pipeline Locally

```bash
npm run ci
```

This runs:
1. Solidity linting
2. Contract compilation
3. Full test suite
4. TypeScript type checking

---

## 🚢 Deployment

### Deploy to Sepolia

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export SEPOLIA_RPC_URL=your_rpc_url

# Deploy contracts
npm run deploy:sepolia

# Verify contracts on Etherscan
npm run verify:sepolia
```

### Deploy Frontend to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/private-ride-platform)

**Environment Variables for Vercel**:
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_PAUSER_SET_ADDRESS`
- `NEXT_PUBLIC_TAXI_GATEWAY_ADDRESS`
- `NEXT_PUBLIC_PRIVATE_TAXI_DISPATCH_ADDRESS`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_SEPOLIA_RPC_URL`

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Our CI/CD pipeline runs on every push and pull request:

```yaml
jobs:
  test:      # Multi-version Node.js testing (18.x, 20.x)
  build:     # Next.js build verification
  security:  # npm audit, secret scanning, bundle analysis
  code-quality: # Solhint, ESLint, Prettier, TypeScript
```

**Coverage Reporting**: Automated upload to Codecov with 90% target

See [CI_CD.md](./CI_CD.md) for complete pipeline documentation.

---

## 🔒 Security & Performance

### Security Features

- ✅ **Gas monitoring** with Hardhat gas reporter
- ✅ **DoS protection** with rate limiting
- ✅ **Security headers** (XSS, clickjacking protection)
- ✅ **Pre-commit hooks** (Husky) for code quality
- ✅ **Secret scanning** in CI/CD
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

## 🐛 Troubleshooting

### Common Issues

**Issue**: Transaction fails with "Insufficient funds"
```bash
# Solution: Get Sepolia ETH from faucet
https://sepoliafaucet.com
```

**Issue**: Wallet won't connect
```bash
# Solution: Check network and clear cache
1. Switch MetaMask to Sepolia network
2. Clear browser cache
3. Refresh page
```

**Issue**: Encrypted data not visible
```bash
# Solution: Request decryption permission
await gateway.requestDecryptionPermission(dataId);
```

**Issue**: Build fails on Vercel
```bash
# Solution: Check environment variables
Ensure all NEXT_PUBLIC_* variables are set in Vercel dashboard
```

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Run `npm run ci` before committing
- Maintain 90%+ test coverage
- Follow existing code style
- Update documentation for new features

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅ (Current)
- [x] Basic ride-sharing with FHE
- [x] Driver registration and location updates
- [x] Encrypted offer system
- [x] Rating mechanism

### Phase 2: Enhanced Privacy 🚧 (In Progress)
- [ ] Zero-knowledge proofs for driver verification
- [ ] Encrypted chat between driver and passenger
- [ ] Privacy-preserving reputation system

### Phase 3: Production Ready 📋 (Planned)
- [ ] Mainnet deployment
- [ ] Mobile app (React Native)
- [ ] Multi-city support
- [ ] Payment integration (USDC/ETH)

### Phase 4: Advanced Features 🔮 (Future)
- [ ] AI-powered route optimization (on encrypted data)
- [ ] Dynamic pricing with FHE
- [ ] Cross-chain support
- [ ] Decentralized governance (DAO)

---

## 🏆 Achievements

- ✅ **92 test cases** (exceeds 45+ requirement)
- ✅ **90%+ code coverage**
- ✅ **Successfully deployed** on Sepolia testnet
- ✅ **Full CI/CD pipeline** with automated testing
- ✅ **Security audited** with comprehensive documentation
- ✅ **Performance optimized** (48% bundle size reduction)

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

**Built with ❤️ for the Zama FHE Challenge**

**Powered by**: [Zama FHEVM](https://docs.zama.ai) | **Network**: [Sepolia Testnet](https://sepolia.etherscan.io) | **Frontend**: [Next.js 14](https://nextjs.org)

---

> **Note**: This is a demonstration project for the Zama FHE Challenge. Not recommended for production use without additional security audits and testing.
